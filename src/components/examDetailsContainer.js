import { useCallback, useEffect, useState } from "react";
import { Button, ButtonGroup, Card, Container, Table } from "react-bootstrap";
import CardHeader from "react-bootstrap/esm/CardHeader";

import { decrypt } from "../functions/AES";

export default function ExamDetailsContainer({ contract, isFaculty, show, setShow }) {
    const [exams, setExams] = useState([]);

    const getDuration = duration => {
        var hours = (duration / 60);
        var rhours = Math.floor(hours);
        var minutes = (hours - rhours) * 60;
        var rminutes = Math.round(minutes);
        return rhours + " hour(s) and " + rminutes + " minute(s).";
    }

    const getExams = useCallback(async _ => {
        const Data = await contract.getExams();
        const examData = await Promise.all(Data.map(async i => {
            return ({
                id: i.id.toNumber(),
                name: i.name.toString(),
                start: i.start.toString(),
                end: i.end.toString(),
                duration: i.duration.toString(),
                faculty: i.faculty.toString(),
                showScore: i.showScore
            });
        }));

        setExams(examData);
    }, [contract]);

    useEffect(_ => {
        if(contract) {            
            getExams();
        }
    }, [contract, getExams]);

    return (<>
        <Container className="mt-5 text-center">
            <Card>
                <CardHeader>
                    <h3>Exams</h3>
                </CardHeader>
                <Card.Body>
                {(!exams.length) ? (<h5>--- You have no exams ---</h5>) : 
                (<>
                    <Table striped hover>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Start</th>
                                <th>End</th>
                                <th>Duration</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                        {exams.map((exam, i) => {
                            return (
                                <tr key={i}>
                                    <td>{i+1}</td>
                                    <td>{decrypt(exam.name)}</td>
                                    <td>{(new Date(decrypt(exam.start))).toLocaleString()}</td>
                                    <td>{(new Date(decrypt(exam.end))).toLocaleString()}</td>
                                    <td>{getDuration(decrypt(exam.duration))}</td>
                                    <td>
                                        <ButtonGroup>
                                            {(isFaculty) ?
                                            (<>
                                                <Button onClick={_ => setShow({...show, viewExam: exam.id})} variant="outline-primary">View</Button>
                                                <Button disabled={(new Date(decrypt(exam.start)) < new Date()) ? true : false} onClick={_ => setShow({...show, updateExam: exam})} variant="outline-primary">Update</Button>
                                                <Button disabled={(new Date(decrypt(exam.end)) <= new Date()) ? false : true} onClick={_ => setShow({...show, evaluate: exam})} variant="outline-primary">Evaluate</Button>
                                            </>) :
                                            (<>
                                                <Button disabled={(new Date(decrypt(exam.start)) <= new Date() && new Date(decrypt(exam.end)) > new Date()) ? false : true} variant="outline-primary" onClick={_ => setShow({...show, startExam: exam})}>Start</Button>
                                                <Button disabled={(new Date(decrypt(exam.end)) <= new Date() && exam.showScore) ? false : true} variant="outline-primary" onClick={_ => setShow({...show, viewScore: exam.id})}>Score</Button>
                                            </>)}
                                        </ButtonGroup>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </Table>
                </>)}
                </Card.Body>
            </Card>
            {(isFaculty) ? <Button className="my-4 px-5 py-2" variant="outline-dark" pill="true" onClick={_ => setShow({...show, createExam: true})}>Create Exam</Button> : null}
        </Container>
    </>);
}