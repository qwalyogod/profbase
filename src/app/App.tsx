import { RouterProvider } from 'react-router';
import { router } from './routes';
import { PortalProvider } from './state/PortalContext';

export default function App() {
  return (
    <PortalProvider>
      <RouterProvider router={router} />
    </PortalProvider>
  );
}
