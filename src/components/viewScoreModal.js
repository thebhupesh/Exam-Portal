import { useState } from "react";
import { Button, Modal } from "react-bootstrap";

import { decrypt } from "../functions/AES";

export default function ViewScoreModal({ contract, show, setShow, setLoader }) {
    const { viewScore } = show;
    const [score, setscore] = useState(null);

    const handleClose = () => {
        setShow({...show, viewScore: 0});
        setscore(null);
    }
    
    const getScore = async examID => {
        setLoader({
            loading: true,
            message: "Getting your score"
        });

        const scoreData = await contract.getMyScore(viewScore);
        if(scoreData !== "") {
            setscore(decrypt(scoreData));
        }

        setLoader({
            loading: false,
            message: ""
        });
    }

    return (<>
        <Modal show={viewScore} onHide={handleClose} onShow={getScore} centered>
            <Modal.Header closeButton>
                <Modal.Title>Score</Modal.Title>
            </Modal.Header>
            <Modal.Body className="lead">
                {(!score) ? <p>You did not attempt the exam.</p> : <p>Your score is <strong>{score}</strong>.</p>}
            </Modal.Body>
            <Modal.Footer>
                <Button type="button" variant="danger" onClick={handleClose}>Close</Button>
            </Modal.Footer>
        </Modal>
    </>);
}