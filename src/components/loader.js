import { Container } from "react-bootstrap";
import { MutatingDots } from "react-loader-spinner";

export default function Loader({ message }) {
    return (<>
        <Container style={{display: "flex", alignItems: "center", justifyContent: "center", height: "100vh"}}>
            <MutatingDots height="100px" width="100px" color="#332D2D" secondaryColor="#332D2D" radius="12.5" ariaLabel="mutating-dots-loading" />
            <h5>{message}...</h5>
        </Container>
    </>);
}