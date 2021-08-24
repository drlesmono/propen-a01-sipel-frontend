import React, { Component } from "react";
import APIConfig from "../../APIConfig";
import Modal from "../../components/Modal";
import {Form, Card, Button} from "react-bootstrap";
import "./style.css";
import classes from "./styles.module.css";
import authHeader from "../../services/auth-header";


class UpdateSequence extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sequence: "",
            isNotFilled: false,
            isError: false,
            isSuccess: false
        };
        this.handleFilled = this.handleFilled.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleCancel = this.handleCancel.bind(this);

    }

    // componentDidMount() {
    //     this.loadData();
    // }

    // async loadData() {
    //     try {
    //         const seq = await APIConfig.get("/order/resetSeq", { headers: authHeader() });
    //         this.setState({ sequence: seq.data });
    //     } catch (error) {
    //         // alert("Oops terjadi masalah pada server");
    //         this.setState({ isError: true });
    //         console.log(error);
    //     }
    // }

    handleFilled(event){
        const { value } = event.target;
        this.setState({ sequence : value });
        // const { value2 } = this.state.sequence;

        // if(value === ""){
        //     this.setState({
        //         isNotFilled : true,
        //         sequence:"" });
        // }else{
            // const tempSeq = {
            //     sequenceNum: value,
            // };
        //     this.setState({
        //         isNotFilled : false,
        //         sequence : value
        //     });
        // }
    }

    handleSubmit(event){
        //event.preventDefault();
        // let test = this.state.isNotFilled;
        // let val = this.state.sequence;
        const { value } = event.target;
        const dataSeq = {
            sequenceNum: this.state.sequence
        }

        if(value !== ""){
            try{
                APIConfig.put(`/order/resetSeq/1`, dataSeq, { headers: authHeader() });
            }catch (error) {
                // alert("Oops terjadi masalah pada server");
                this.setState({ isError: true });
                console.log(error);
            }
            this.setState({ isSuccess: true, isError: false, isNotFilled: false });
        }
        else{
            // alert("Masukkan angka pada kolom yang tersedia!");
            this.setState({ isNotFilled: true });
        }

    }

    // Menutup semua modal
    handleCancel(event) {
        event.preventDefault();

        this.setState({
            isError: false, 
            isSuccess: false,
            isNotFilled: false
        });
        // this.loadData();
    }


    render() {
        let {isNotFilled, sequence, isError, isSuccess} = this.state;

        return(
            <div id="content">
            <div class="test">
                <div>
                    <h1 class="text-center">Reset Urutan Nomor Order</h1>
                    <Card>
                            <Form.Control type="number" className="sequence" size="sm" placeholder="Ubah nilai..." onChange={this.handleFilled}/>
                            <Button className={classes.button4} onClick={() => this.handleSubmit()}>Update</Button>
                    </Card>
                </div>
            </div>

                {/* Menampilkan modal berisi notifikasi ketika berhasil menyimpan data atau error */}
                <Modal
                    show={isSuccess || isError || isNotFilled}
                    dialogClassName="modal-90w"
                    aria-labelledby="contained-modal-title-vcenter"
                >
                     <Modal.Header closeButton onClick={this.handleCancel}>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Notification
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {isSuccess?
                        <>
                            <div className="d-flex justify-content-center">Sequence berhasil diupdate menjadi {sequence}</div><br></br>
                            <div className="d-flex justify-content-center">
                                <Button variant="primary" className={classes.button1} onClick={this.handleCancel}>
                                    Kembali
                                </Button>
                            </div>
                        </> :
                        <>
                        <div className="d-flex justify-content-center"> {isError ? "Oops terjadi masalah pada server" : "Masukkan angka pada kolom yang tersedia!" }</div><br></br>
                        <div className="d-flex justify-content-center">
                            <Button variant="primary" className={classes.button1} onClick={this.handleCancel}>
                                Kembali
                            </Button>
                        </div>
                        </>}
                    </Modal.Body>
                </Modal>
            </div>
        );
    }

}

export default UpdateSequence;