import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Modal } from "react-bootstrap";

export default function RegisterModal({ contract, show, setShow, setLoader }) {
    const [user, setUser] = useState({
        id: 0,
        username: "",
        name: "",
        isFaculty: false,
        registered: false
    });
    const navigate = useNavigate();

    const updateUserState = e => {
        setUser({
            ...user,
            [e.target.name]: (e.target.name === "isFaculty") ? ((e.target.value === "true") ? true : false) : e.target.value
        });
    }

    const registerUser = async e => {
        e.preventDefault();

        setLoader({
            loading: true,
            message: "Checking username availability"
        });

        const Data = await contract.checkUsername(user.username);
        if(Data) {
            setLoader({
                loading: true,
                message: "Registering user"
            });
            
            const txn = await contract.register(user);
            await txn.wait();
            
            navigate("/dashboard", { replace: true });
        }
        else {
            setLoader({
                loading: false,
                message: ""
            });
            
            alert("Username not available.");
        }
    }
	
    return (<>
        <Modal show={show} onHide={_ => setShow(false)} centered>
            <Form onSubmit={registerUser}>
                <Modal.Header closeButton>
                    <Modal.Title>User Registration</Modal.Title><hr />
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Username</Form.Label>
                        <Form.Control name="username" type="text" placeholder="Enter username" autoFocus onChange={updateUserState} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control name="name" type="text" placeholder="Enter name" onChange={updateUserState} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>User Type</Form.Label>
                        <Form.Control name="isFaculty" as="select" defaultValue={""} onChange={updateUserState} required>
                            <option disabled value="">Select user type</option>
                            <option value={false}>Student</option>
                            <option value={true}>Faculty</option>
                        </Form.Control>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button type="submit" variant="primary">Register</Button>
                </Modal.Footer>
            </Form>  
        </Modal>
    </>);
}