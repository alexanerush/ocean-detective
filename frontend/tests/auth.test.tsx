import { it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../src/app/providers/store/store';
import { MemoryRouter } from 'react-router-dom';
import { AuthForm } from '../src/features/auth/AuthForm';
it('validates registration before any server request', () => {
  render(
    <MemoryRouter>
      <Provider store={store}><AuthForm register /></Provider>
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
  expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
  expect(screen.getByText('Use at least 12 characters.')).toBeInTheDocument();
});
