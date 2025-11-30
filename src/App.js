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
  lastBalance: 0,
  depositAmount: '',
  withdrawAmount: '',
  requestLoanAmount: '',
  payLoanAmount: '',
};

function reducer(state, action) {
  if (!state.isActive && action.type !== 'openAccount') {
    return state;
  }
  switch (action.type) {
    case 'openAccount':
      return {
        ...state,
        isActive: true,
        balance: 500,
        lastBalance: 0 // Reset when opening new account
      };

    case 'setDepositAmount': // Add this case
      return {
        ...state,
        depositAmount: action.amount
      };
    case 'setWithdrawAmount': // Add this case
      return {
        ...state,
        withdrawAmount: action.amount
      };
    case 'setRequestLoanAmount': // Add this case
      return {
        ...state,
        requestLoanAmount: action.amount
      };
    case 'setPayLoanAmount': // Add this case
      return {
        ...state,
        payLoanAmount: action.amount
      };
    case 'deposit':
      return {
        ...state,
        balance: Number(state.balance) + Number(state.depositAmount || 0), // Use state.depositAmount
        depositAmount: '' // Clear after deposit
      };
    case 'withdraw':
      return {
        ...state,
        balance: Number(state.balance) - Number(state.withdrawAmount || 0),
        withdrawAmount: '' // Clear after withdraw
      };
    case 'requestLoan':
      // Customer can only request a loan if there is no loan yet
      if (state.loan === 0) {
        return {
          ...state,
          loan: Number(state.requestLoanAmount) || 0,
          balance: Number(state.balance) + Number(state.requestLoanAmount || 0),
          requestLoanAmount: '' // Clear after request loan
        };
      }
      return state; // If loan already exists, return current state unchanged
    case 'payLoan':
      // Allow partial loan payments, but prevent overpayment
      const paymentAmount = Number(state.payLoanAmount || 0);
      const remainingLoan = Number(state.loan);
      
      // Only allow payment if there's a loan, payment amount is valid, and doesn't exceed remaining loan
      if (remainingLoan > 0 && paymentAmount > 0 && paymentAmount <= remainingLoan) {
        return {
          ...state,
          balance: Number(state.balance) - paymentAmount,
          loan: remainingLoan - paymentAmount, // Reduce loan by payment amount
          payLoanAmount: '' // Clear after payment
        };
      }
      return state; // Return unchanged if invalid payment (including overpayment)

    case 'closeAccount':
      // Customer can close account if:
      // 1. No loan (loan === 0), OR
      // 2. Balance is sufficient to pay off the loan (balance >= loan)
      const currentBalance = Number(state.balance);
      const currentLoan = Number(state.loan);
      
      if (currentLoan === 0) {
        // No loan - close account normally
        return {
          ...state,
          isActive: false,
          lastBalance: currentBalance,
          balance: 0,
          loan: 0
        };
      } else if (currentBalance >= currentLoan) {
        // Balance is sufficient to pay off loan - auto-pay and close
        return {
          ...state,
          isActive: false,
          lastBalance: currentBalance - currentLoan, // Save balance after paying loan
          balance: 0,
          loan: 0
        };
      }
      // If loan exists and balance is insufficient, cannot close
      return state;
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
      <span style={{ marginLeft: '10px', color: 'gray' }}>
          (Remaining loan: {state.loan})
        </span>
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
        <span style={{ marginRight: '10px' }}>Amount to Deposit</span>
        <input
          type="number"
          value={state.depositAmount}
          step="50"
          onChange={(e) =>
            dispatch({ type: "setDepositAmount", amount: e.target.value })
          }
        />
        <button
          onClick={() => dispatch({ type: "deposit" })}
          disabled={!state.isActive}
          style={{ marginLeft: '10px' }}
        >
          Deposit
        </button>
      </p>
      <p>
        <span style={{ marginRight: '10px' }}>Amount to Withdraw</span>
        <input
          type="number"
          value={state.withdrawAmount}
          step="50"
          onChange={(e) => dispatch({ type: "setWithdrawAmount", amount: e.target.value })}
          style={{ marginLeft: '10px' }}
        />
        <button
          onClick={() => dispatch({ type: "withdraw" })}
          disabled={!state.isActive}
          style={{ marginLeft: '10px' }}>
          Withdraw
        </button>
      </p>
      <p>
        <span style={{ marginRight: '10px' }}>Amount to Request a Loan</span>
        <input
          type="number"
          value={state.requestLoanAmount}
          step="5000"
          onChange={(e) => dispatch({ type: "setRequestLoanAmount", amount: e.target.value })}
          style={{ marginLeft: '10px' }}
        />
        <button
          onClick={() => dispatch({ type: 'requestLoan' })}
          disabled={!state.isActive || state.loan !== 0}
          style={{ marginLeft: '10px' }}>
          Request a loan
        </button>
        
      </p>
      <p>
        <span style={{ marginRight: '10px' }}>Amount to Pay Loan</span>
        <input
          type="number"
          value={state.payLoanAmount}
          step="100"
          min="0"
          max={state.loan}
          onChange={(e) => {
            const value = e.target.value;
            const numValue = Number(value);
            // Prevent entering more than remaining loan
            if (value === '' || (numValue >= 0 && numValue <= state.loan)) {
              dispatch({ type: "setPayLoanAmount", amount: value });
            }
          }}
          style={{ 
            marginLeft: '10px',
            borderColor: state.payLoanAmount && Number(state.payLoanAmount) > state.loan ? 'red' : undefined
          }}
          placeholder={`Max: ${state.loan}`}
        />
        {state.payLoanAmount && Number(state.payLoanAmount) > state.loan && (
          <span style={{ marginLeft: '10px', color: 'red' }}>
            Cannot pay more than remaining loan ({state.loan})
          </span>
        )}
        <button
          onClick={() => dispatch({ type: 'payLoan' })}
          disabled={
            !state.isActive || 
            state.loan === 0 || 
            !state.payLoanAmount || 
            Number(state.payLoanAmount) <= 0 ||
            Number(state.payLoanAmount) > state.loan  // Prevent overpayment
          }
          style={{ marginLeft: '10px' }}>
          Pay loan
        </button>
      </p>
      <p>
        <button
          onClick={() => dispatch({ type: 'closeAccount' })}
          disabled={!state.isActive || (state.loan > 0 && state.balance < state.loan)}
        >
          Close account
        </button>
      </p>
    </div>
  );
}
