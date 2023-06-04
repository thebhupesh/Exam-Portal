import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import Web3Modal from "web3modal";

import ExamPortal from "../contract/ExamPortal.json";
import Loader from "../components/loader";
import Header from "../components/header";
import RegisterModal from "../components/registerModal";
import Homepage from "../components/homepage";

export default function Home() {
    const user = ({
        username: "",
        name: "",
        isFaculty: false,
        registered: false
    });
    const [contract, setContract] = useState(null);
    const [showRegister, setShowRegister] = useState(false);
    const [loader, setLoader] = useState({
        loading: true,
        message: "Loading"
    });
    const navigate = useNavigate();

    const connectWeb3 = useCallback(async _ => {
        setLoader({
            loading: true,
            message: "Connecting"
        });
        
        const web3Modal = new Web3Modal({
            // network: "goerli",
            cacheProvider: true
        });
        const connection = await web3Modal.connect().catch(_ => {
            window.location.reload();
        });
        connection.on("accountsChanged", _ => {
            window.location.reload();
        });
        connection.on("chainChanged", _ => {
            window.location.reload();
        });
        connection.on("disconnect", _ => {
            window.location.reload();
        });
        const signer = new ethers.providers.Web3Provider(connection).getSigner();
        const contract = new ethers.Contract(process.env.REACT_APP_CONTRACT_ADDRESS, ExamPortal.abi, signer);

        setContract(contract);
    }, []);
    
    const loadUser = useCallback(async _ => {
        setLoader({
            loading: true,
            message: "Fetching details"
        });
        
        const Data = await contract.getUser();
        if(Data.registered) {
            navigate("/dashboard", { replace: true });
        }
        else {
            setLoader({
                loading: false,
                message: ""
            });
            
            setShowRegister(true);
        }
    }, [contract, navigate]);

    useEffect(_ => {
        if(contract) {
            loadUser();
        }
        else {
            setLoader({
                loading: false,
                message: ""
            });
        }
    }, [contract, loadUser]);

    return (<>
        {(loader.loading) ? <Loader message={loader.message} /> :
        <>
            <Header connect={connectWeb3} user={user} show={{}} setShow={_ => {}} inExam={false} />
            <RegisterModal contract={contract} show={showRegister} setShow={setShowRegister} setLoader={setLoader} />
            <Homepage connect={connectWeb3} />
        </>}
    </>);
}