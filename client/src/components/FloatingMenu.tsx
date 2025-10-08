import { useEffect, useRef, useState } from "react";
import { useUIState } from "../context/uiState/useUIState";
import "./FloatingMenu.css";
import { MenuTypes, type MenuType } from "../types/types";


interface FloatingMenuProps {
  title: string;
  type: MenuType;
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
}

export function FloatingMenu({ 
  title,
  type, 
  children, 
  initialPosition = { x: 0, y: 0 }
}: FloatingMenuProps) {

    const [position, setPosition] = useState(initialPosition);
    const isDragging = useRef<boolean>(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const menuRef = useRef<HTMLDivElement>(null);
    const uiStateContext = useUIState();

    useEffect(() => {
        if (menuRef.current && menuRef.current.parentElement) {
            const container = menuRef.current.parentElement;
            const containerRect = container.getBoundingClientRect();
            const menuRect = menuRef.current.getBoundingClientRect();
            
            setPosition({
                x: (containerRect.width - menuRect.width) / 2,
                y: (containerRect.height - menuRect.height) / 2
            });
        }
    }, []);


    const constrainPosition = (x: number, y: number) => {
        if (!menuRef.current?.parentElement) return { x, y };

        const container = menuRef.current.parentElement;
        const menuRect = menuRef.current.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const constrainedX = Math.max(0, Math.min(x, containerRect.width - menuRect.width));
        const constrainedY = Math.max(0, Math.min(y, containerRect.height - menuRect.height));

        return { x: constrainedX, y: constrainedY };
    };

    const handleDragStart = (e: React.MouseEvent) => {
        if (!menuRef.current?.parentElement) return;
        isDragging.current = true;

        const container = menuRef.current.parentElement;
        const containerRect = container.getBoundingClientRect();

        dragOffset.current = {
            x: e.clientX - containerRect.left - position.x,
            y: e.clientY - containerRect.top - position.y
        };

        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', handleDragEnd);
        
    };

    const handleDrag = (e: MouseEvent) => {
        if (isDragging.current && menuRef.current?.parentElement) { 
            const container = menuRef.current.parentElement;
            const containerRect = container.getBoundingClientRect();
            
            const newX = e.clientX - containerRect.left - dragOffset.current.x;
            const newY = e.clientY - containerRect.top - dragOffset.current.y;
            
            const constrained = constrainPosition(newX, newY);
            setPosition(constrained);
        }
    };

    const handleDragEnd = () => {
        isDragging.current = false;
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', handleDragEnd);
    };


    return (
        <div 
        ref={menuRef}
        className= {`floating-menu${type === MenuTypes.MENU_EDIT_NODE ? "-edit" : ""}`}
        onMouseDown={handleDragStart}
        style={{
            position: 'absolute',
            left: `${position.x}px`,
            top: `${position.y}px`,
        }}
        >
            <div className="floating-menu-header">
                <h3>{title}</h3>
                <button className="close-button" onClick={() => uiStateContext.deleteMenu(type)}>×</button>
            </div>
            <div className="floating-menu-content">
                {children}
            </div>
        </div>
    );
}