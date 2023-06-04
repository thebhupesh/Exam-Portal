import axios from "axios";
import { useState } from "react";
import { Button, Modal } from "react-bootstrap";

import { decrypt, encrypt } from "../functions/AES";

export default function EvaluateExamModal({ contract, show, setShow, setLoader }) {
    const { evaluate } = show;
    const [responses, setResponses] = useState([]);
    const [performance, setPerformance] = useState({
        min: 0,
        max: 0,
        avg: 0,
        count: 0
    });

    const evaluateExam = async _ => {
        setLoader({
            loading: true,
            message: "Evaluating exam"
        });

        const answersData = await contract.getAnswers(evaluate.id);
        const answersURI = await contract.tokenURI(answersData);
        const answersMetadata = await axios.get(decrypt(answersURI));
        const answers = await axios.get(decrypt(answersMetadata.data.URI)+decrypt(answersMetadata.data.name));

        const responseData = await contract.getResponses(evaluate.id);
        
        let min = Number.MAX_VALUE, max = Number.MIN_VALUE, sum = 0, count = 0;

        const responses = await Promise.all(responseData[0].map(async (data,i) => {
            const responseURI = await contract.tokenURI(data.response);
            const responseMetadata = await axios.get(decrypt(responseURI));
            const response = await axios.get(decrypt(responseMetadata.data.URI)+decrypt(responseMetadata.data.name));

            let score = 0;

            for(let i=0; i<decrypt(response.data.count); i++) {
                if(decrypt(response.data["q"+(i+1)]) === decrypt(answers.data["q"+(i+1)])) {
                    score++;
                }
            }

            if(score < min) {
                min = score;
            }
            if(score > max) {
                max = score;
            }

            sum += score;
            count++;

            return ({
                username: responseData[1][i].toString(),
                score: score
            });
        }));

        setResponses(responses);
        
        setPerformance({
            min: (min === Number.MAX_VALUE) ? 0 : min,
            max: (max === Number.MIN_VALUE) ? 0 : max,
            avg: (count === 0) ? 0 : sum/count,
            count: count
        });

        setLoader({
            loading: false,
            message: ""
        });
    }

    const publishScores = async _ => {
        setLoader({
            loading: true,
            message: "Publishing scores"
        });

        if(!evaluate.showScore) {
            let scores = [];

            for(let i=0; i<responses.length; i++) {      
                scores.push(encrypt(responses[i].score.toString()));
            }

            const txn = await contract.publishScore(evaluate.id, scores);
            await txn.wait();

            window.location.reload();
        }
        else {
            alert("Scores already published.");
        }

        setLoader({
            loading: false,
            message: ""
        });
    }

    const downloadReport = _ => {
        setLoader({
            loading: true,
            message: "Downloading report"
        });

        const headers = ["username,score"];

        let reportCSV = responses.reduce((data, info) => {
            const { username, score } = info;
            data.push([username, score].join(","));
            return data;
        }, []);

        const data = [...headers, ...reportCSV].join("\n");
        const fileName = `${decrypt(evaluate.name)}.csv`;

        const blob = new Blob([data], { type: "text/csv" });
        
        const a = document.createElement("a");
        a.download = fileName;
        a.href = window.URL.createObjectURL(blob);
        
        const event = new MouseEvent("click", {
            view: window,
            bubbles: true,
            cancelable: true,
        });

        a.dispatchEvent(event);
        a.remove();

        setLoader({
            loading: false,
            message: ""
        });
    }

    // useEffect(_ => {
    //     if(contract && evaluate) {
    //         evaluateExam();
    //     }
    // }, [evaluate, contract, evaluateExam]);
    
    return (<>
        <Modal show={evaluate} onHide={_ => setShow({...show, evaluate: null})} onShow={evaluateExam} centered>
            <Modal.Header closeButton>
                <Modal.Title>Performance</Modal.Title>
            </Modal.Header>
            <Modal.Body className="lead">
                <strong>Minimum Score: </strong>{performance.min}<hr />
                <strong>Maximum Score: </strong>{performance.max}<hr />
                <strong>Average Score: </strong>{performance.avg}<hr />
                <strong>No. of responses: </strong>{performance.count}
            </Modal.Body>
            <Modal.Footer>
                <Button type="buttom" variant="outline-primary" onClick={publishScores}>Publish Score</Button>
                <Button type="button" variant="outline-dark" onClick={downloadReport}>Download Report</Button>
            </Modal.Footer>
        </Modal>
    </>);
}