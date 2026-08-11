// src/components/marketplace/AppleToast.ts
import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faApple } from '@fortawesome/free-brands-svg-icons';

interface AppleToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

const AppleToast: React.FC<AppleToastProps> = ({ message, type }) => {
  const toastType = {
    success: toast.success,
    error: toast.error,
    info: toast.info,
    warning: toast.warning,
  };

  const handleToast = () => {
    toastType[type](message, {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  return (
    <div className="apple-toast-container">
      <button className="apple-toast-button" onClick={handleToast}>
        <FontAwesomeIcon icon={faApple} />
        {message}
      </button>
      <ToastContainer
        position={toast.POSITION.TOP_CENTER}
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={true}
        draggable={true}
        pauseOnHover={true}
      />
    </div>
  );
};

export default AppleToast;

/* src/components/marketplace/AppleToast.css */
.apple-toast-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.apple-toast-button {
  background-color: #0b0f17;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

.apple-toast-button:hover {
  background-color: #1a1d23;
}

.apple-toast-button:focus {
  outline: none;
}

.apple-toast-button:active {
  transform: scale(0.9);
}

// src/types/index.ts
interface AppleToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

// src/lib/notifications.ts
import { toast } from 'react-toastify';

const notify = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
  toast[type](message, {
    position: toast.POSITION.TOP_CENTER,
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};

export default notify;

// src/app/layout.tsx
import React from 'react';
import AppleToast from '../components/marketplace/AppleToast';

const Layout = () => {
  return (
    <div>
      <AppleToast message="Hello, World!" type="success" />
    </div>
  );
};

export default Layout;