import { useState, useCallback } from "react";

export default function useConfirm() {
  const [state, setState] = useState({ open: false, payload: null });

  const confirm = useCallback((payload) => {
    return new Promise((resolve) => {
      setState({ open: true, payload, resolve });
    });
  }, []);

  const handle = (result) => {
    state.resolve?.(result);
    setState({ open: false, payload: null });
  };

  return {
    confirmState: state,
    askConfirm: confirm,
    handleConfirm: () => handle(true),
    handleCancel: () => handle(false)
  };
}