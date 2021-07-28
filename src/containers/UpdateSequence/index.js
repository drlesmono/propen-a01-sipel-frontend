import React, { Component } from "react";
import APIConfig from "../../APIConfig";
import CustomizedTables from "../../components/Table";
import CustomizedButtons from "../../components/Button";
import Modal from "../../components/Modal";
import {Form, Card, Table, Button} from "react-bootstrap";
import { Input, FormControlLabel } from "@material-ui/core";
import "./style.css";
import classes from "./styles.module.css";


class UpdateSequence extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sequence: "",
            isFilled: false,
        };
        this.handleFilled = this.handleFilled.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

    }

    componentDidMount() {
        this.loadData();
    }

    async loadData() {
        try {
            const seq = await APIConfig.get("/order/resetSeq");
            this.state = {
                sequence: seq.data,
            };
        } catch (error) {
            alert("Oops terjadi masalah pada server");
            console.log(error);
        }
    }

    handleFilled(event){
        const { value } = event.target;
        const { value2 } = this.state.sequence;

        if(value === ""){
            this.setState({
                isFilled : false,
                sequence:"" });
        }else{
            const tempSeq = {
                sequenceNum: value,
            };
            this.setState({
                isFilled : true,
                sequence : tempSeq
            });
        }
    }
    handleSubmit(event){
        //event.preventDefault();
        let test = this.state.isFilled;
        let val = this.state.sequence;

        if(test === true){
            try{
                APIConfig.put(`/order/resetSeq/1`, val);

            }catch (error) {
                alert("Oops terjadi masalah pada server");
                console.log(error);
            }
        }
        else{
            alert("Masukkan angka pada kolom yang tersedia!");
        }

    }



    render() {
        let {isFilled, sequence} = this.state;

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
            </div>
        );
    }

}

export default UpdateSequence;