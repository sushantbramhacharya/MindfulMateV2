import { Link } from 'react-router-dom';
const SplashScreen = () => {
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
        <div className="p-6 rounded flex gap-4">
          <img src="./assets/logo.png" className="w-[200px] backdrop-blur rounded-2xl" alt="Logo" />
          <div className="flex flex-col justify-center ">
          <p className="text-3xl">Your Personal <br />  Mental Health <br /> Assistant</p>
          </div>
        </div>
        <div>
        <Link className="!text-white inline-block m-2 px-6 py-4 rounded-4xl bg-[#951FD3]" to="/login">Start Your Journey</Link>
        </div>
      </div>
  )
}

export default SplashScreen