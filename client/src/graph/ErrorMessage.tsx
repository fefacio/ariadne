interface ErrorMessageProps {
    message: string | null;
    setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
}

export function ErrorMessage({ message, setErrorMessage }: ErrorMessageProps) {
    if (!message) return null;

    return (
        <div className="error-message">
            <span>{message}</span>
            <button className="dismiss-button" onClick={() => setErrorMessage(null)}>×</button>
        </div>
    );
}