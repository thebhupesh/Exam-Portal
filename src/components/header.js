import { Link } from "react-router-dom";
import { Button, Col, Container, Nav, Navbar, NavDropdown, Row } from "react-bootstrap";

import Home from "../pages/home";

export default function Header({ connect, user, show, setShow, inExam }) {
    return (<>
        <Navbar expand="sm" variant="dark" bg="dark">
            <Container fluid>
                <Navbar.Brand active="true">
                    <Row>
                        <Col><h2 className="my-0">{(!inExam) ? <Link to="/home" element={<Home />} className="text-white" style={{"textDecoration": "none"}}>Exam Portal</Link> : "Exam Portal"}</h2></Col>
                        <Col className="p-0 my-auto"><p className="my-0">{(user.registered) ? ((user.isFaculty) ? " (Faculty)" : " (Student)") : ""}</p></Col>
                    </Row>
                </Navbar.Brand>
                <Nav>
                    <Nav.Item>
                    {(!user.registered) ?
                        (<Button variant="outline-light" rounded="true" onClick={_ => connect()}>Connect Wallet</Button>) :
                    ((!inExam) ?
                        (<NavDropdown title={user.name + " (" + user.username + ")"} rounded="true" active="true">
                            <NavDropdown.Item onClick={_ => setShow({...show, updateUser: true})}>Update Details</NavDropdown.Item>
                        </NavDropdown>) :
                        (<Navbar.Text>{user.name + " (" + user.username + ")"}</Navbar.Text>)
                    )}
                    </Nav.Item>
                </Nav>
            </Container>
        </Navbar>
    </>);
}