import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Xpress headline', () => {
  render(<App />);
  const heading = screen.getByText(/Xpress - Top Headlines/i);
  expect(heading).toBeInTheDocument();
});
