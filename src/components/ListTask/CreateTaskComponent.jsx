import React, { Component } from 'react'
import InstallationProjectService from "../../services/InstallationProjectService";
//import { ThemeConsumer } from 'react-bootstrap/esm/ThemeProvider';
import Modal from "react-bootstrap/Modal";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from "react-bootstrap";
import classes from "./styles.module.css";

class CreateTaskComponent extends Component {
    constructor(props) {
        super(props)

        this.state = {
            id: this.props.match.params.id,
            taskName: '',
            description: '',
            isSuccess: false

        }
        this.changeTaskNameHandler = this.changeTaskNameHandler.bind(this);
        this.changeDescriptionHandler = this.changeDescriptionHandler.bind(this);
        this.saveTask = this.saveTask.bind(this);
        
    }

    changeTaskNameHandler= (event) => {
        this.setState({taskName: event.target.value});
    }

    changeDescriptionHandler= (event) => {
        this.setState({description: event.target.value});
    }

    
    saveTask = (e) => {
        e.preventDefault();
        let task = {taskName: this.state.taskName, description: this.state.description};
        console.log('task => ' + JSON.stringify(task));

        InstallationProjectService.createTask(task,this.state.id).then( this.setState({isSuccess: true}) );
        // .then(res =>{
        //     this.props.history.push(`/list-task/${this.state.id}`);
        // });
        // alert("Task Berhasil Ditambahkan");
    }

    cancel(){
        this.props.history.push(`/list-task/${this.state.id}`); //harusnya ke list-task/id
    }

    render() {
        const { isSuccess } = this.state;

        return (
            <div>
                {/* Menampilkan modal berisi notifikasi ketika berhasil menyimpan data */}
                <Modal
                    show={isSuccess}
                    dialogClassName="modal-90w"
                    aria-labelledby="contained-modal-title-vcenter"
                >
                     <Modal.Header closeButton onClick={this.cancel.bind(this)}>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Notification
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="d-flex justify-content-center">Task Berhasil Ditambahkan.</div><br></br>
                        <div className="d-flex justify-content-center">
                            <Button variant="primary" className={classes.button1} onClick={this.cancel.bind(this)}>
                                Kembali
                            </Button>
                        </div>
                    </Modal.Body>
                </Modal>
                <br/><br/>
                <div className="container">
                    <div className="row">
                        <div className = "card col-md-6 offset-md-3 offset-md-3">
                            <br/>
                            <h3 className="text-center">Form Tambah Task</h3>
                            <div className = "card-body">
                                <form>
                                    <div className="form-group">
                                        <label> Nama Task: </label>
                                        <input placeholder="Nama Task" name="taskname" className="form-control" 
                                            value={this.state.taskName} onChange={this.changeTaskNameHandler}/>
                                    </div>
                                    <div className="form-group">
                                        <label>Deskripsi Task</label>
                                        <input placeholder="Deskripsi Task" name="description" className="form-control" 
                                            value={this.state.description} onChange={this.changeDescriptionHandler}/>
                                    </div>
                                    <button className="btn btn-success" onClick={this.saveTask}>Simpan</button>
                                    <button className="btn btn-danger" onClick={this.cancel.bind(this)} style={{marginLeft: "10px"}}>Batal</button>

                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default CreateTaskComponent