import { useSession } from '../context/session/useSession';
import { MenuTypes } from '../types/types';
import './Toolbar.css';

export function Toolbar(){
    const sessionContext = useSession();
    return (
        <div className="toolbar">
            <button>Hello</button>
            <button>Goodbye</button>
            <button onClick={() => sessionContext.setOpenMenu(MenuTypes.MENU_DRAW)}>Drawing</button>
            <button onClick={() => sessionContext.setOpenMenu(MenuTypes.MENU_GENERATE)}>Generate</button>
        </div>
    )
}