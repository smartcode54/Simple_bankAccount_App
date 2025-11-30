import "./styles.css";
import { useReducer } from "react";

/*
INSTRUCTIONS / CONSIDERATIONS:

1. Let's implement a simple bank account! It's similar to the example that I used as an analogy to explain how useReducer works, but it's simplified (we're not using account numbers here)

2. Use a reducer to model the following state transitions: openAccount, deposit, withdraw, requestLoan, payLoan, closeAccount. Use the `initialState` below to get started.

3. All operations (expect for opening account) can only be performed if isActive is true. If it's not, just return the original state object. You can check this right at the beginning of the reducer

4. When the account is opened, isActive is set to true. There is also a minimum deposit amount of 500 to open an account (which means that the balance will start at 500)

5. Customer can only request a loan if there is no loan yet. If that condition is met, the requested amount will be registered in the 'loan' state, and it will be added to the balance. If the condition is not met, just return the current state

6. When the customer pays the loan, the opposite happens: the money is taken from the balance, and the 'loan' will get back to 0. This can lead to negative balances, but that's no problem, because the customer can't close their account now (see next point)

7. Customer can only close an account if there is no loan, AND if the balance is zero. If this condition is not met, just return the state. If the condition is met, the account is deactivated and all money is withdrawn. The account basically gets back to the initial state
*/

const initialState = {
  balance: 0,
  loan: 0,
  isActive: false,
  lastBalance: 0
};

function reducer(state, action) {
  if (!state.isActive && action.type !== 'openAccount') {
    return state;
  }
  switch (action.type) {
    case 'openAccount':
      return { ...state, 
        isActive: true,
        balance: 500,
        lastBalance: 0 // Reset when opening new account
      };
    case 'deposit':
      return { 
        ...state, 
        balance: state.balance + action.amount };
    case 'withdraw':
      return{
        ...state,
        balance: state.balance - action.amount
      };
    case 'requestLoan':
      // Customer can only request a loan if there is no loan yet
      if (state.loan === 0) {
        return {
          ...state,
          loan: action.amount,
          balance: state.balance + action.amount
        };
      }
      return state; // If loan already exists, return current state unchanged
    case 'payLoan':
      return {
        ...state,
        balance: state.balance - state.loan,
        loan: 0
      };

    case 'closeAccount':
      // Customer can only close an account if there is no loan
      // If balance > 0, withdraw all money (reset balance to 0)
      if (state.loan === 0) {
        return {
          ...state,
          isActive: false,
          lastBalance: state.balance, // Save the balance before closing
          balance: 0,
          loan: 0
        };
      }
      return state; // If loan exists, return current state unchanged
    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <div className="App">
      <h1>useReducer Bank Account</h1>
      <p>Balance: {state.balance}</p>
      <p>Loan: {state.loan}</p>
      {!state.isActive && state.balance === 0 && state.lastBalance > 0 && (
        <p>Last Balance: {state.lastBalance}</p>
      )}
      <p>Is Active: {state.isActive ? 'Yes' : 'No'}</p>
      {!state.isActive && state.balance === 0 && state.lastBalance > 0 && (
        <p style={{ color: 'green' }}>
          Account closed. All funds withdrawn. Last balance: {state.lastBalance}
        </p>
      )}

      <p>
        <button 
          onClick={() => dispatch({ type: 'openAccount' })} 
          disabled={state.isActive}
        >
          Open account
        </button>
      </p>
      <p>
        <button 
          onClick={() => dispatch({ type: 'deposit', amount: 150 })} 
          disabled={!state.isActive}
        >
          Deposit 150
        </button>
      </p>
      <p>
        <button 
          onClick={() => dispatch({ type: 'withdraw', amount: 50 })} 
          disabled={!state.isActive}
        >
          Withdraw 50
        </button>
      </p>
      <p>
        <button 
          onClick={() => dispatch({ type: 'requestLoan', amount: 5000 })} 
          disabled={!state.isActive || state.loan !== 0}
        >
          Request a loan of 5000
        </button>
      </p>
      <p>
        <button 
          onClick={() => dispatch({ type: 'payLoan' })} 
          disabled={!state.isActive || state.loan === 0}
        >
          Pay loan
        </button>
      </p>
      <p>
        <button 
          onClick={() => dispatch({ type: 'closeAccount' })} 
          disabled={!state.isActive || state.loan !== 0}
        >
          Close account
        </button>
      </p>
    </div>
  );
}
