import { useEffect, useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";

export default function UpdateUserModal({ contract, info, show, setShow, setLoader }) {
    const [user, setUser] = useState({
        id: 0,
        username: "",
        name: "",
        isFaculty: false,
        registered: false
    });
    
    const updateUserState = e => {
        setUser({
            ...user,
            [e.target.name]: e.target.value
        });
    }

    const updateUserDetails = async e => {
        e.preventDefault();

        setLoader({
            loading: true,
            message: "Checking username availability"
        });

        const Data = await contract.checkUsername(user.username);
        if(Data || user.username === info.username) {
            setLoader({
                loading: true,
                message: "Updating user details"
            });
            
            const txn = await contract.updateUser(user);
            await txn.wait();
            
            window.location.reload();
        }
        else {
            setLoader({
                loading: false,
                message: ""
            });
            
            alert("Username not available.");
        }
    }

    useEffect(_ => {
        setUser(info);
    }, [info]);

    return (<>
        <Modal show={show.updateUser} onHide={_ => setShow({...show, updateUser: false})} centered>
            <Form onSubmit={updateUserDetails}>
                <Modal.Header closeButton>
                    <Modal.Title>Update User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Username</Form.Label>
                        <Form.Control name="username" type="text" placeholder="Enter new username" value={user.username} autoFocus onChange={updateUserState} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control name="name" type="text" placeholder="Enter new name" value={user.name} onChange={updateUserState} required />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button type="submit" variant="primary">Update</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    </>);
}