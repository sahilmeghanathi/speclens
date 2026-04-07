import { useCallback, useReducer, useMemo } from 'react';
import type { ValidationError } from '../utils/specValidation';

interface SpecEditorState {
  specJson: string;
  parsedSpec: any;
  validationErrors: ValidationError[] | null;
  isDirty: boolean;
  isSaving: boolean;
  selectedComponentId: string | null;
}

type SpecEditorAction =
  | { type: 'SET_SPEC_JSON'; payload: string }
  | { type: 'SET_PARSED_SPEC'; payload: any }
  | { type: 'SET_VALIDATION_ERRORS'; payload: ValidationError[] | null }
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_SELECTED_COMPONENT'; payload: string | null }
  | { type: 'RESET' };

function specEditorReducer(
  state: SpecEditorState,
  action: SpecEditorAction
): SpecEditorState {
  switch (action.type) {
    case 'SET_SPEC_JSON':
      return state.specJson === action.payload
        ? state
        : { ...state, specJson: action.payload, isDirty: true };

    case 'SET_PARSED_SPEC':
      return state.parsedSpec === action.payload
        ? state
        : { ...state, parsedSpec: action.payload };

    case 'SET_VALIDATION_ERRORS':
      return state.validationErrors === action.payload
        ? state
        : { ...state, validationErrors: action.payload };

    case 'SET_DIRTY':
      return state.isDirty === action.payload
        ? state
        : { ...state, isDirty: action.payload };

    case 'SET_SAVING':
      return state.isSaving === action.payload
        ? state
        : { ...state, isSaving: action.payload };

    case 'SET_SELECTED_COMPONENT':
      return state.selectedComponentId === action.payload
        ? state
        : { ...state, selectedComponentId: action.payload };

    case 'RESET':
      return {
        specJson: '',
        parsedSpec: null,
        validationErrors: null,
        isDirty: false,
        isSaving: false,
        selectedComponentId: null,
      };

    default:
      return state;
  }
}

const initialState: SpecEditorState = {
  specJson: '',
  parsedSpec: null,
  validationErrors: null,
  isDirty: false,
  isSaving: false,
  selectedComponentId: null,
};

/**
 * Custom hook for spec editor state management.
 * Uses useReducer to prevent unnecessary re-renders of components
 * that only need specific state slices.
 */
export function useSpecEditor() {
  const [state, dispatch] = useReducer(specEditorReducer, initialState);

  // Memoized setters to prevent function identity changes
  const setSpecJson = useCallback((json: string) => {
    dispatch({ type: 'SET_SPEC_JSON', payload: json });
  }, []);

  const setParsedSpec = useCallback((spec: any) => {
    dispatch({ type: 'SET_PARSED_SPEC', payload: spec });
  }, []);

  const setValidationErrors = useCallback((errors: ValidationError[] | null) => {
    dispatch({ type: 'SET_VALIDATION_ERRORS', payload: errors });
  }, []);

  const setDirty = useCallback((dirty: boolean) => {
    dispatch({ type: 'SET_DIRTY', payload: dirty });
  }, []);

  const setSaving = useCallback((saving: boolean) => {
    dispatch({ type: 'SET_SAVING', payload: saving });
  }, []);

  const setSelectedComponentId = useCallback((id: string | null) => {
    dispatch({ type: 'SET_SELECTED_COMPONENT', payload: id });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  // Return memoized state and setters
  return useMemo(
    () => ({
      specJson: state.specJson,
      parsedSpec: state.parsedSpec,
      validationErrors: state.validationErrors,
      isDirty: state.isDirty,
      isSaving: state.isSaving,
      selectedComponentId: state.selectedComponentId,
      setSpecJson,
      setParsedSpec,
      setValidationErrors,
      setDirty,
      setSaving,
      setSelectedComponentId,
      reset,
    }),
    [state, setSpecJson, setParsedSpec, setValidationErrors, setDirty, setSaving, setSelectedComponentId, reset]
  );
}
