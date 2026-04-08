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

const DEFAULT_SPEC = JSON.stringify(
  {
    type: 'Card',
    id: 'root-card',
    props: {
      title: '📊 Demo Analytics Dashboard',
    },
    children: [
      {
        type: 'Grid',
        id: 'metrics-grid',
        props: {
          columns: 3,
        },
        children: [
          {
            type: 'StatCard',
            id: 'stat-1',
            props: {
              label: 'Total Revenue',
              value: '$45,231',
              change: '+12.5%',
            },
          },
          {
            type: 'StatCard',
            id: 'stat-2',
            props: {
              label: 'Active Users',
              value: '8,391',
              change: '+8.2%',
            },
          },
          {
            type: 'StatCard',
            id: 'stat-3',
            props: {
              label: 'Conversion Rate',
              value: '3.24%',
              change: '+2.1%',
            },
          },
        ],
      },
      {
        type: 'Grid',
        id: 'content-grid',
        props: {
          columns: 2,
        },
        children: [
          {
            type: 'Card',
            id: 'card-1',
            props: {
              title: '✨ Interactive Components',
              description: 'Try changing the "type" property to StatCard, Card, or Grid to see different components rendered. Edit in real-time on the left!',
            },
          },
          {
            type: 'Card',
            id: 'card-2',
            props: {
              title: '📈 Real-time Updates',
              description: 'Changes to the JSON spec are reflected instantly in the preview. Check the render metrics below to track performance.',
            },
          },
          {
            type: 'Card',
            id: 'card-3',
            props: {
              title: '🎯 Component Props',
              description: 'Each component type has different props. StatCard uses label, value, change. Card uses title, description. Grid uses columns.',
            },
          },
          {
            type: 'Card',
            id: 'card-4',
            props: {
              title: '🔧 Try It Yourself',
              description: 'Edit the JSON on the left. Change "columns" in Grid, add more StatCards, or modify Card titles to see the demo in action!',
            },
          },
        ],
      },
    ],
  },
  null,
  2
);

function getInitialState(): SpecEditorState {
  try {
    const parsed = JSON.parse(DEFAULT_SPEC);
    return {
      specJson: DEFAULT_SPEC,
      parsedSpec: parsed,
      validationErrors: null,
      isDirty: false,
      isSaving: false,
      selectedComponentId: null,
    };
  } catch {
    return {
      specJson: '',
      parsedSpec: null,
      validationErrors: null,
      isDirty: false,
      isSaving: false,
      selectedComponentId: null,
    };
  }
}

const initialState: SpecEditorState = getInitialState();

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
