import { useState, useCallback } from 'react';

export function useUndoRedo<T>(initialState: T) {
  const [state, setState] = useState<T>(initialState);
  const [past, setPast] = useState<T[]>([]);
  const [future, setFuture] = useState<T[]>([]);

  const set = useCallback(
    (newPresent: T | ((prev: T) => T)) => {
      setState((prevPresent) => {
        const computedPresent = typeof newPresent === 'function'
          ? (newPresent as (prev: T) => T)(prevPresent)
          : newPresent;
        
        // Prevent pushing duplicate states
        if (JSON.stringify(prevPresent) === JSON.stringify(computedPresent)) {
          return prevPresent;
        }

        // Limit past history to 20 states to conserve memory
        setPast((prevPast) => [...prevPast.slice(-19), prevPresent]);
        setFuture([]);
        return computedPresent;
      });
    },
    []
  );

  const undo = useCallback(() => {
    if (past.length === 0) return;
    
    setPast((prevPast) => {
      const newPast = [...prevPast];
      const previous = newPast.pop()!;
      
      setFuture((prevFuture) => [state, ...prevFuture]);
      setState(previous);
      return newPast;
    });
  }, [past, state]);

  const redo = useCallback(() => {
    if (future.length === 0) return;

    setFuture((prevFuture) => {
      const newFuture = [...prevFuture];
      const next = newFuture.shift()!;
      
      setPast((prevPast) => [...prevPast, state]);
      setState(next);
      return newFuture;
    });
  }, [future, state]);

  const reset = useCallback((newPresent: T) => {
    setState(newPresent);
    setPast([]);
    setFuture([]);
  }, []);

  return { 
    state, 
    set, 
    undo, 
    redo, 
    reset, 
    canUndo: past.length > 0, 
    canRedo: future.length > 0 
  };
}
export default useUndoRedo;
