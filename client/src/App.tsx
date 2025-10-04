import './App.css'
import { SVGCanvas } from './graph/SVGCanvas'
import { Toolbox } from './toolbox/Toolbox'
import { Toolbar } from './toolbar/Toolbar'
import { useSession } from './context/session/useSession'

function App() {
  const sessionContext = useSession();
  console.log(sessionContext.sessionId);
  console.log("IS READY: "+sessionContext.isServerReady)
  if (!sessionContext.isServerReady){
    return (
      <div> 
        <p> Server is waking up! (~2 minutes)</p>
      </div>
    )
  }
  return (
    <>
      <div className="grid-container">
        <Toolbox/>
        <Toolbar/>
        <SVGCanvas key={sessionContext.resetKey}/>
        
      </div>
    </>
  )
}

export default App
