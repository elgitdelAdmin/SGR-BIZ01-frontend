import React, { useEffect, useState,useRef } from "react";
import { Navigate, useLocation,useNavigate,useParams } from "react-router-dom";
const Home = () => {
    useEffect(()=>{
        !isLogged && navigate("/");
    },[])
    return ( 
        <div>Home page</div>
     );
}
 
export default Home;