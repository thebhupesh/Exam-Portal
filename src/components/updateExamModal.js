import { useEffect, useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";

import { decrypt, encrypt } from "../functions/AES";

export default function UpdateExamModal({ contract, show, setShow, setLoader }) {
    const { updateExam } = show;
    const [exam, setExam] = useState({
        id: 0,
        name: "",
        questions: 0,
        answers: 0,
        start: "",
        duration: "",
        end: "",
        faculty: "",
        showScore: false
    });

    const getDate = _ => {
        const date = new Date();
        return (date.getFullYear()+"-"+String(date.getMonth()+1).padStart(2, "0")+"-"+String(date.getDate()).padStart(2, "0")+"T"+String(date.getHours()).padStart(2, "0")+":"+String(date.getMinutes()).padStart(2, "0"));
    }

    const getMaxDuration = _ => {
        if(exam.start && exam.end) {
            return (new Date(decrypt(exam.end)).valueOf() - new Date(decrypt(exam.start)).valueOf())/60000;
        }
        else return 1;
    }

    const updateExamState = e => {
        setExam({
            ...exam,
            [e.target.name]: encrypt(e.target.value)
        });
    }

    const updateExamDetails = async e => {
        e.preventDefault();

        setLoader({
            loading: true,
            message: "Updating exam details"
        });

        const txn = await contract.updateExamDetails(exam);
        await txn.wait();
        
        window.location.reload();
    }

    const deleteExam = async e => {
        setLoader({
            loading: true,
            message: "Deleting exam"
        });

        const txn = await contract.deleteExam(exam.id);
        await txn.wait();
        
        window.location.reload();
    }

    useEffect(_ => {
        if(updateExam) {
            setExam(exam => {
                return ({
                    ...exam,
                    ...updateExam
                });
            });
        }
    }, [updateExam]);

    return (<>
        <Modal show={updateExam} onHide={_ => setShow({...show, updateExam: null})} centered>
            <Form onSubmit={updateExamDetails}>
                <Modal.Header closeButton>
                    <Modal.Title>Update Exam</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control name="name" type="text" placeholder="Enter new exam name" value={decrypt(exam.name)} autoFocus onChange={updateExamState} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Start</Form.Label>
                            <Form.Control name="start" type="datetime-local" min={getDate()} value={decrypt(exam.start)} onChange={updateExamState} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>End</Form.Label>
                            <Form.Control name="end" type="datetime-local" min={(exam.start) ? decrypt(exam.start) : getDate()} value={decrypt(exam.end)} onChange={updateExamState} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Duration (mins.)</Form.Label>
                            <Form.Control name="duration" type="number" placeholder="Enter new duration of exam" min={1} max={getMaxDuration()} value={decrypt(exam.duration)} onChange={updateExamState} required />
                        </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button type="button" variant="danger" onClick={deleteExam}>Delete</Button>
                    <Button type="submit" variant="primary">Update</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    </>);
}