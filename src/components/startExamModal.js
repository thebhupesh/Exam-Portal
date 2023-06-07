import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Modal } from "react-bootstrap";

import { decrypt, encrypt } from "../functions/AES";

export default function StartExamModal({ contract, show, setShow, setLoader }) {
    const { startExam } = show;
    const [start, setStart] = useState({
        status: true,
        message: ""
    });
    const navigate = useNavigate();

    const checkStatus = async _ => {
        setLoader({
            loading: true,
            message: "Checking status"
        });

        const Data = await contract.examSubmitted(startExam.id);
        const time = (new Date(decrypt(startExam.end)).valueOf() - new Date().valueOf()) / 60000 < decrypt(startExam.duration);
        if(Data) {
            setStart({
                status: false,
                message: "Exam already submitted."
            });
        }
        else if(time) {
            setStart({
                status: false,
                message: "You are late."
            });
        }
        
        setLoader({
            loading: false,
            message: ""
        });
    }

    const exam = _ => {
        navigate(`/exam/${encodeURIComponent(encrypt(JSON.stringify(startExam)))}`, { replace: true });
    }
    
    return(<>
        <Modal show={show.startExam} onHide={_ => setShow({...show, startExam: null})} onShow={checkStatus} centered>
            {(start.status) ? <>
                <Modal.Header closeButton>
                    <Modal.Title>Exam Instructions</Modal.Title>
                </Modal.Header>
                <Modal.Body className="lead">
                    <ol>
                        <li>Do not disconnect metamask.</li>
                        <li>Complete exam before time ends.</li>
                        <li>Exam auto submits at the end of time.</li>
                        <li>To submit the exam confirm the transaction after submit.</li>
                        <li>Do not close the window when exam is submitting.</li>
                    </ol>
                </Modal.Body>
                <Modal.Footer>
                    <Button type="button" onClick={exam}>Start</Button>
                </Modal.Footer>
            </> : <>
                <Modal.Header closeButton>
                    <Modal.Title>Message</Modal.Title>
                </Modal.Header>
                <Modal.Body className="lead">
                    {start.message}
                </Modal.Body>
            </>}
        </Modal>
    </>);
}