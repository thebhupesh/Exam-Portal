import Web3Modal from "web3modal";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ethers } from "ethers";
import { Web3Storage } from "web3.storage";
import { Buffer } from "buffer";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";

import ExamPortal from "../contract/ExamPortal.json";
import Loader from "../components/loader";
import Header from "../components/header";
import { decrypt, encrypt } from "../functions/AES";

export default function Exam() {
    const { exam } = useParams();
    const [contract, setContract] = useState(null);
    const [data, setData] = useState({
        id: 0,
        username: "",
        name: "",
        isFaculty: false,
        registered: false,
        exam: {
            count: 0
        },
        response: null
    });
    const [timer, setTimer] = useState(null);
    const [loader, setLoader] = useState({
        loading: true,
        message: "Loading"
    });
    const navigate = useNavigate();

    const connectWeb3 = useCallback(async _ => {
        setLoader({
            loading: true,
            message: "Connecting"
        });

        const web3Modal = new Web3Modal({
            // network: "goerli",
            cacheProvider: true
        });
        const connection = await web3Modal.connect().catch(_ => {
            navigate("/404", { replace: true });
        });
        connection.on("accountsChanged", _ => {
            navigate("/404", { replace: true });
        });
        connection.on("chainChanged", _ => {
            navigate("/404", { replace: true });
        });
        connection.on("disconnect", _ => {
            navigate("/404", { replace: true });
        });
        const signer = new ethers.providers.Web3Provider(connection).getSigner();
        const contract = new ethers.Contract(process.env.REACT_APP_CONTRACT_ADDRESS, ExamPortal.abi, signer);
        
        setContract(contract);
    }, [navigate]);
    
    const fetchExam = useCallback(async _ => {
        setLoader({
            loading: true,
            message: "Fetching exam"
        });

        const Exam = JSON.parse(decrypt(exam));

        const userData = await contract.getUser();
        const hasExam = await contract.userHasExam(Exam.id);
        const submittedStatus = await contract.examSubmitted(Exam.id);
        const time = (new Date(decrypt(Exam.end)).valueOf() - new Date().valueOf())/60000 < decrypt(Exam.duration);
        
        if(!userData.registered || userData.isFaculty || submittedStatus || time || !hasExam) {
            navigate("/404", { replace: true });
        }
        else {
            const hours = Math.floor(decrypt(Exam.duration)/60);
            const minutes = Math.floor(decrypt(Exam.duration) - hours*60);

            setTimer({
                hours: hours,
                minutes: minutes,
                seconds: 0
            });

            const questionsData = await contract.getQuestions(Exam.id);
            const questionsURI = await contract.tokenURI(questionsData);
            const questionsMetadata = await axios.get(decrypt(questionsURI));
            const questions = await axios.get(decrypt(questionsMetadata.data.URI)+decrypt(questionsMetadata.data.name));

            let Response = ({
                count: questions.data.count
            });

            for(let i=1; i<=decrypt(questions.data.count); i++) {
                Response = ({
                    ...Response,
                    ["q"+i]: encrypt("o0")
                });
            }
            
            setData({
                id: userData.id.toString(),
                username: userData.username.toString(),
                name: userData.name.toString(),
                isFaculty: userData.isFaculty,
                registered: userData.registered,
                exam: questions.data,
                response: Response
            });

            setLoader({
                loading: false,
                message: ""
            });
        }
    }, [contract, exam, navigate]);

    const updateResponseState = e => {
        setData({
            ...data,
            response: {
                ...data.response,
                [e.target.name]: encrypt(e.target.value)
            }
        });
    }

    const submitResponse = async _ => {
        setLoader({
            loading: true,
            message: "Submitting exam"
        });

        setTimer({
            hours: 0,
            minutes: 0,
            seconds: 0
        });

        const client = new Web3Storage({ token: process.env.REACT_APP_IPFS_API_TOKEN });
        const Exam = JSON.parse(decrypt(exam));
        
        const responseBuffer = Buffer.from(JSON.stringify(data.response));
        const responseFileName = `${Exam.name}-response.txt`;

        const nftFile = [new File([responseBuffer], responseFileName)];
        const nftCID = await client.put(nftFile);

        let responseMetadata = Buffer.from(JSON.stringify({
            name: encrypt(responseFileName),
            description: "NFT of exam response.",
            URI: encrypt(`https://${nftCID}.ipfs.w3s.link/`)
        }));

        const responseMetadataFile = [new File([responseMetadata], "response-metadata.json")];
        const metadataCID = await client.put(responseMetadataFile);

        const URI = [encrypt(`https://${metadataCID}.ipfs.w3s.link/response-metadata.json`)];
        const price = ethers.utils.parseUnits("0", "ether");

        const txn = await contract.submitExam(Exam.id, URI, [price]);
        await txn.wait();

        navigate("/dashboard", { replace: true });
    }

    const confirmSubmittion = e => {
        e.preventDefault();

        let confirm = prompt(`Type "CONFIRM" to submit.`);

        if(confirm === "CONFIRM") {
            submitResponse();
        }
        else {
            alert("Invalid input.\nRetry...");
        }
    }

    useEffect(_ => {
        if(!contract) {
            connectWeb3();
        }
        else {
            fetchExam();
        }
    }, [contract, connectWeb3, fetchExam]);

    const getTimeLeft = _ => {
        if(timer.seconds > 0) {
            return ({
                ...timer,
                seconds: timer.seconds-1
            });
        }
        else {
            if(timer.minutes > 0) {
                return ({
                    ...timer,
                    minutes: timer.minutes-1,
                    seconds: 59
                });
            }
            else {
                if(timer.hours > 0) {
                    return ({
                        hours: timer.hours-1,
                        minutes: 59,
                        seconds: 59
                    });
                }
                else {
                    return timer;
                }
            }
        }
    }

    useEffect(_ => {
        let timeout;

        if(timer && !timer.hours && !timer.minutes && !timer.seconds && !loader.loading) {
            clearTimeout(timeout);
            submitResponse();
        }
        else if(timer && !loader.loading) {
            timeout = setTimeout(_ => {
                setTimer(getTimeLeft());
            }, 1000);
        }
    });

    return (<>
        {(loader.loading) ? <Loader message={loader.message} /> :
        <>
            <Header user={data} show={{}} setShow={{}} inExam={true} connect={_ => {}} />
            <Card className="mx-auto sticky-top border-0 bg-dark text-white rounded-0 rounded-bottom text-center" style={{width: "12rem"}}>
                <Card.Body><strong>Time Left: </strong>{((timer.hours > 9) ? timer.hours : "0"+timer.hours) + ":" + ((timer.minutes > 9) ? timer.minutes : "0"+timer.minutes) + ":" + ((timer.seconds > 9) ? timer.seconds : "0"+timer.seconds)}</Card.Body>
            </Card>
            <Container fluid>
                <Form onSubmit={confirmSubmittion}>
                {Array.apply(null, {length: decrypt(data.exam.count)}).map((_, i) => {
                    return (<Container fluid key={i} className="mt-4">
                        <hr />
                        <div className="lead px-5"><strong>Question {i+1}: </strong>{decrypt(data.exam["q"+(i+1)])}</div>
                        <hr />
                        <Form.Group className="my-3" >
                            <Row className="mt-2">
                            {Array.apply(null, {length: 4}).map((_, j) => {
                                return (<Col className="px-5 lead" key={j} sm="6">
                                    <Form.Check
                                        type="radio"
                                        name={"q"+(i+1)}
                                        label={decrypt(data.exam["q"+(i+1)+"o"+(j+1)])}
                                        value={"o"+(j+1)}
                                        onChange={updateResponseState}
                                        checked={decrypt(data.response["q"+(i+1)]) === "o"+(j+1)}
                                        required
                                    />
                                </Col>);
                            })}
                            </Row>
                        </Form.Group>
                        <hr />
                    </Container>)
                })}
                    <Container className="text-center"><Button className="my-4 px-5 py-2" type="submit" variant="primary">Submit</Button></Container>
                </Form>
            </Container>
        </>}
    </>)
}