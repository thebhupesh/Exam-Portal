import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import Web3Modal from "web3modal";

import ExamPortal from "../contract/ExamPortal.json";
import Loader from "../components/loader";
import Header from "../components/header";
import ExamDetailsContainer from "../components/examDetailsContainer";
import UpdateUserModal from "../components/updateUserModal";
import CreateExamModal from "../components/createExamModal";
import ViewExamModal from "../components/viewExamModal";
import UpdateExamModal from "../components/updateExamModal";
import StartExamModal from "../components/startExamModal";
import EvaluateExamModal from "../components/evaluateExamModal";
import ViewScoreModal from "../components/viewScoreModal";

export default function Dashboard() {
    const [data, setData] = useState({
        contract: null,
        address: null
    });
    const [user, setUser] = useState({
        id: 0,
        username: "",
        name: "",
        isFaculty: false,
        registered: false
    });
    const [show, setShow] = useState({
        updateUser: false,
        createExam: false,
        viewExam: 0,
        updateExam: null,
        startExam: null,
        evaluate: null,
        viewScore: 0
    });
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
            navigate("/home", { replace: true });
        });
        connection.on("accountsChanged", _ => {
            window.location.reload();
        });
        connection.on("chainChanged", _ => {
            navigate("/home", { replace: true });
        });
        connection.on("disconnect", _ => {
            navigate("/home", { replace: true });
        });
        const signer = new ethers.providers.Web3Provider(connection).getSigner();
        const contract = new ethers.Contract(process.env.REACT_APP_CONTRACT_ADDRESS, ExamPortal.abi, signer);

        let address = null;
        await signer.getAddress().then(val => {
            address = val;
        });
        
        setData({
            contract: contract,
            address: address
        });
    }, [navigate]);
    
    const loadUser = useCallback(async _ => {
        setLoader({
            loading: true,
            message: "Fetching details"
        });

        const Data = await data.contract.getUser();
        if(!Data.registered) {
            navigate("/home", { replace: true });
        }

        setUser({
            id: Data.id.toNumber(),
            username: Data.username.toString(),
            name: Data.name.toString(),
            isFaculty: Data.isFaculty,
            registered: Data.registered
        });

        setLoader({
            loading: false,
            message: ""
        });
    }, [data, navigate]);

    useEffect(_ => {
        if(!data.contract) {
            connectWeb3();
        }
        else {
            loadUser();
        }
    }, [data, connectWeb3, loadUser]);

    return (<>
        {(loader.loading) ? <Loader message={loader.message} /> :
        <>
            <Header user={user} show={show} setShow={setShow} inExam={false} connect={_ => {}} />
            <ExamDetailsContainer contract={data.contract} isFaculty={user.isFaculty} show={show} setShow={setShow} />
            <UpdateUserModal contract={data.contract} info={user} show={show} setShow={setShow} setLoader={setLoader} />
            {(user.isFaculty) ? <>
                <CreateExamModal data={data} show={show} setShow={setShow} setLoader={setLoader} />
                <ViewExamModal contract={data.contract} show={show} setShow={setShow} loading={loader.loading} setLoader={setLoader} />
                <UpdateExamModal contract={data.contract} show={show} setShow={setShow} setLoader={setLoader} />
                <EvaluateExamModal contract={data.contract} show={show} setShow={setShow} setLoader={setLoader} />
            </> : <>
                <StartExamModal contract={data.contract} show={show} setShow={setShow} setLoader={setLoader} />
                <ViewScoreModal contract={data.contract} show={show} setShow={setShow} setLoader={setLoader} />
            </>}
        </>}
    </>);
}