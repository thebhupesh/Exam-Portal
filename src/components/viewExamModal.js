import React, { useState } from "react";
import axios from "axios";
import { Button, Col, Container, Modal, Row } from "react-bootstrap";

import { decrypt } from "../functions/AES";

export default function ViewExamModal({ contract, show, setShow, loading, setLoader }) {
    const { viewExam } = show;
    const [exam, setExam] = useState({
        questions: {
            count: 0
        },
        answers: null
    });

    const fetchExam = async _ => {
        setLoader({
            loading: true,
            message: "Fetching exam"
        });
        
        const questionsData = await contract.getQuestions(viewExam);
        const questionsURI = await contract.tokenURI(questionsData);
        const answersData = await contract.getAnswers(viewExam);
        const answersURI = await contract.tokenURI(answersData);

        const questionsMetadata = await axios.get(decrypt(questionsURI));
        const answersMetadata = await axios.get(decrypt(answersURI));

        const questions = await axios.get(decrypt(questionsMetadata.data.URI)+decrypt(questionsMetadata.data.name));
        const answers = await axios.get(decrypt(answersMetadata.data.URI)+decrypt(answersMetadata.data.name));
        
        setExam({
            questions: questions.data,
            answers: answers.data
        });

        setLoader({
            loading: false,
            message: ""
        });
    }

    return (<>
        <Modal show={viewExam} onHide={_ => setShow({...show, viewExam: 0})} onShow={fetchExam} fullscreen>
            <Modal.Header closeButton>
                <Modal.Title className="display-5"><strong>Exam</strong></Modal.Title>
            </Modal.Header>
            <Modal.Body>
            {Array.apply(null, {length: decrypt(exam.questions.count)}).map((_, i) => {
                return (<Container fluid key={i}>
                    <hr />
                    <Row>
                        <Col sm="2" className="lead text-end my-auto"><strong className="my-0">Question {i+1} :</strong></Col>
                        <Col sm="10" className="lead my-auto">{decrypt(exam.questions["q"+(i+1)])}</Col>
                    </Row>
                    <hr />
                    <Row className="mt-2">
                    {Array.apply(null, {length: 4}).map((_, j) => {
                        return (<React.Fragment key={j}>
                            <Col sm="2" className="lead text-end my-auto"><strong className="my-0">Option {j+1} :</strong></Col>
                            <Col sm="4" className="my-auto">{decrypt(exam.questions["q"+(i+1)+"o"+(j+1)])}</Col>
                        </React.Fragment>);
                    })}
                    </Row>
                    <hr />
                    <Row>
                        <Col sm="2" className="lead text-end my-auto"><strong>Answer : </strong></Col>
                        <Col sm="10" className="lead my-auto">Option {decrypt(exam.answers["q"+(i+1)]).slice(1)}</Col>
                    </Row>
                    <hr />
                </Container>);
            })}
            </Modal.Body>
            <Modal.Footer>
                <Button type="button" variant="danger" onClick={_ => setShow({...show, viewExam: 0})}>Close</Button>
            </Modal.Footer>
        </Modal>
    </>);
}