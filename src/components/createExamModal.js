import React, { createRef, useEffect, useState } from "react";
import Papa from "papaparse";
import { ethers } from "ethers";
import { Web3Storage } from "web3.storage";
import { Buffer } from "buffer";
import { Button, Modal, Form } from "react-bootstrap";

import { decrypt, encrypt } from "../functions/AES";

export default function CreateExamModal({ data, show, setShow, setLoader }) {
    const { contract, address } = data;
    const [exam, setExam] = useState({
        id: 0,
        name: "",
        questions: 0,
        answers: 0,
        start: null,
        end: null,
        duration: null,
        faculty: null,
        showScore: false
    });
    const [students, setStudents] = useState(null);
    const studentsRef = createRef();
    const [questions, setQuestions] = useState({
        count: 0
    });
    const [answers, setAnswers] = useState(null);
    const [showAddQuestions, setShowAddQuestions] = useState(false);

    const getDate = _ => {
        const date = new Date();
        return (date.getFullYear()+"-"+String(date.getMonth()+1).padStart(2, "0")+"-"+String(date.getDate()).padStart(2, "0")+"T"+String(date.getHours()).padStart(2, "0")+":"+String(date.getMinutes()).padStart(2, "0"));
    }

    const getMaxDuration = _ => {
        if(exam.start && exam.end) {
            return ((new Date(decrypt(exam.end)).valueOf() - new Date(decrypt(exam.start)).valueOf())/60000)-5;
        }
        else return 1;
    }
    
    const updateExamState = e => {
        setExam({
            ...exam,
            [e.target.name]: encrypt(e.target.value)
        });
    }
    
    const parseCSV = file => {
        return new Promise((resolve,reject) => {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: results => {
                    let value = "";
                    
                    results.data.forEach(data => {
                        Object.keys(data).forEach((val,i) => {
                            if(val === "username") {
                                value += Object.values(data)[i]+",";
                            }
                        });
                    });
                    
                    resolve(value);
                },
                error: err => {
                    reject(err);
                }
            });
        });
    }
    
    const updateStudentsState = async e => {
        if(e.target.name === "upload") {
            let value = await parseCSV(e.target.files[0]);
            value = value.slice(0,-1).replace(/\s/g, "");
            
            if(value === "") {
                alert("Invalid file provided.");
            }
            
            studentsRef.current.value = value;
            studentsRef.current.disabled = true;
            
            setStudents(Array.from(new Set(value.split(","))));
        }
        else {
            setStudents(Array.from(new Set(e.target.value.replace(/\s/g, "").split(","))));
        }
    }

    const updateQuestionsState = e => {        
        setQuestions({
            ...questions,
            [e.target.name]: encrypt(e.target.value)
        });
    }

    const updateAnswersState = e => {
        setAnswers({
            ...answers,
            [e.target.name]: encrypt("o"+e.target.value)
        });
    }

    const uploadNFTs = async _ => {
        const client = new Web3Storage({ token: process.env.REACT_APP_IPFS_API_TOKEN });
        
        setLoader({
            loading: true,
            message: "Uploading NFTs"
        });
        
        const questionsBuffer = Buffer.from(JSON.stringify(questions));
        const questionsFileName = `${exam.name}-${address}-questions.txt`;
        const answersBuffer = Buffer.from(JSON.stringify(answers));
        const answersFileName = `${exam.name}-${address}-answers.txt`;
        
        const nftFiles = [
            new File([questionsBuffer], questionsFileName),
            new File([answersBuffer], answersFileName)
        ];
        const nftCID = await client.put(nftFiles);

        setLoader({
            loading: true,
            message: "Uploading metadata files"
        });
        
        let questionsMetadata = Buffer.from(JSON.stringify({
            name: encrypt(questionsFileName),
            description: "NFT of exam questions.",
            URI: encrypt(`https://${nftCID}.ipfs.w3s.link/`)
        }));
        let answersMetadata = Buffer.from(JSON.stringify({
            name: encrypt(answersFileName),
            description: "NFT of exam answers.",
            URI: encrypt(`https://${nftCID}.ipfs.w3s.link/`)
        }));
        
        const metadataFiles = [
            new File([questionsMetadata], "questions-metadata.json"),
            new File([answersMetadata], "answers-metadata.json")
        ];
        const metadataCID = await client.put(metadataFiles);

        return metadataCID;
    }
    
    const createExam = async e => {
        e.preventDefault();

        const cid = await uploadNFTs();
        const URI = [encrypt(`https://${cid}.ipfs.w3s.link/questions-metadata.json`), encrypt(`https://${cid}.ipfs.w3s.link/answers-metadata.json`)];
        const price = ethers.utils.parseUnits("0", "ether");

        setLoader({
            loading: true,
            message: "Creating exam"
        });

        const txn = await contract.createExam(exam, URI, [price,price], students);
        await txn.wait();
        
        window.location.reload();
    }

    useEffect(_ => {
        setExam(exam => {
            return ({
                ...exam,
                faculty: address
            });
        });
    }, [address]);

    return (<>
        <Modal show={show.createExam} onHide={_ => setShow({...show, createExam: false})} centered>
            <Form onSubmit={e => {
                e.preventDefault();
                setShowAddQuestions(true);
            }}>
                <Modal.Header closeButton>
                    <Modal.Title>Create Exam</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control name="name" type="text" placeholder="Enter exam name" autoFocus onChange={updateExamState} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Start</Form.Label>
                            <Form.Control name="start" type="datetime-local" min={getDate()} onChange={updateExamState} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>End</Form.Label>
                            <Form.Control name="end" type="datetime-local" min={(exam.start) ? exam.start : getDate()} onChange={updateExamState} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Duration (mins.)</Form.Label>
                            <Form.Control name="duration" type="number" placeholder="Enter duration of exam" min={1} max={getMaxDuration()} onChange={updateExamState} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Student ID</Form.Label>
                            <Form.Control name="studentID" type="text" placeholder="Enter student IDs eg:abc,xyz,..." ref={studentsRef} onChange={updateStudentsState} required />
                            <p className="my-2 text-center">OR</p>
                            <Form.Control name="upload" type="file" accept=".csv" variant="outline-dark" onChange={updateStudentsState} />
                            <p className="text-danger">Note: Upload CSV file with a column named "username"</p>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>No. of Questions</Form.Label>
                            <Form.Control name="count" type="number" placeholder="Enter number of question" min={1} onChange={updateQuestionsState} required />
                        </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button type="submit" variant="primary">Add Questions</Button>
                </Modal.Footer>
            </Form>
        </Modal>

        <Modal show={showAddQuestions} onHide={_ => setShowAddQuestions(false)} centered>
            <Form onSubmit={createExam}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Questions</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                {Array.apply(null, {length: decrypt(questions.count)}).map((_, i) => {
                    return (<React.Fragment key={i}>
                        <Form.Group className="mb-3">
                            <Form.Label>Question {i+1}</Form.Label>
                            <Form.Control name={"q"+(i+1)} type="text" placeholder="Enter question" required onChange={updateQuestionsState} />
                        </Form.Group>
                        <hr />
                        {Array.apply(null, {length: 4}).map((_, j) => {
                            return (<Form.Group key={"o"+j} className="mb-3">
                                <Form.Label>Option {j+1}</Form.Label>
                                <Form.Control name={"q"+(i+1)+"o"+(j+1)} type="text" placeholder="Enter option" required onChange={updateQuestionsState} />
                            </Form.Group>);
                        })}
                        <hr />
                        <Form.Group className="mb-3">
                            <Form.Label>Answer {i+1}</Form.Label>
                            <Form.Control name={"q"+(i+1)} type="number" placeholder="Enter option number" min={1} max={4} required onChange={updateAnswersState} />
                        </Form.Group>
                        <hr />
                    </React.Fragment>);
                })}
                </Modal.Body>
                <Modal.Footer>
                    <Button type="submit" variant="primary">Create</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    </>);
}