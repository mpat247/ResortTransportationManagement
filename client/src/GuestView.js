import React from 'react';
import { Card } from 'react-bootstrap';
import ManageReservations from './ManageReservations';
import './GuestView.css'; // Make sure to link the CSS file for styling

const GuestView = () => {
  return (
    <div className="guest-view-container mt-4">
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title className="text-center mb-4">Guest Dashboard</Card.Title>
          <ManageReservations />
        </Card.Body>
      </Card>
    </div>
  );
};

export default GuestView;
