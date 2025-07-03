import {useState} from "react";
import LoginComponent from "../components/LoginComponent";

const LoginScreen = () => {
    const [LoginSwitch, setLoginSwitch] = useState(false)
    
  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-r from-purple-300 via-purple-400 to-purple-800">
      <div className="flex flex-col md:flex-row items-center gap-10 p-6 rounded-xl bg-purple-300 bg-opacity-10 shadow-lg">
        {!LoginSwitch?<>
        <LeftBox/>
         <LoginComponent setLoginSwitch={setLoginSwitch} loginSwitch={LoginSwitch} /></>:
         <>
         <LoginComponent setLoginSwitch={setLoginSwitch} loginSwitch={LoginSwitch} />
          <LeftBox/></>}
        
      </div>
    </div>
  );
};

const LeftBox = () => {
  return (
    <div className="bg-purple-800 text-white p-6 rounded-3xl w-80 flex flex-col items-center shadow-lg">
      <img
        src="./assets/logo.png"
        className="w-[200px] backdrop-blur rounded-2xl"
        alt="Logo"
      />
      <h2 className="text-xl font-semibold mt-4">Mental Health Matters</h2>
    </div>
  );
};

export default LoginScreen;
