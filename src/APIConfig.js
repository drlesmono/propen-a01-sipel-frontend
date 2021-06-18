import axios from "axios";

const APIConfig= axios.create({
    // baseURL: "https://propen-a01-sipel.herokuapp.com/api/v1",
    baseURL: "https://propen-a01-local.herokuapp.com/api/v1",
});

export default APIConfig;
