import React from 'react';
import { render } from '@testing-library/react';
import Podium from '../Components/Podium';

test('Podium renders top3', () => {
  const top3 = [
    { id: 1, nom: 'A', prenom: 'One', moyenne_cycle: 16 },
    { id: 2, nom: 'B', prenom: 'Two', moyenne_cycle: 15 },
    { id: 3, nom: 'C', prenom: 'Three', moyenne_cycle: 14 },
  ];
  const { getByText } = render(<Podium top3={top3} />);
  expect(getByText(/A One/)).toBeTruthy();
  expect(getByText(/#1/)).toBeTruthy();
});
