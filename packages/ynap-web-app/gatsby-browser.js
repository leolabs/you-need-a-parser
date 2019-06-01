const toastify = require('react-toastify');

export const onServiceWorkerUpdateReady = () => {
  toastify.toast.info(
    `YNAP has been updated. Please click this message or reload the page to load the latest version.`,
    { autoClose: false, onClose: () => window.location.reload() },
  );
};
