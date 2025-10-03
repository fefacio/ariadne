import './App.css'
import { SVGCanvas } from './graph/SVGCanvas'
import { Toolbox } from './toolbox/Toolbox'
import { Toolbar } from './toolbar/Toolbar'
import { useSession } from './context/session/useSession'

function App() {
  const sessionContext = useSession();
  console.log(sessionContext.sessionId);

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
