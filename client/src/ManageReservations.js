import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Modal, Form, Table } from 'react-bootstrap';
import './ManageReservations.css';

const ManageReservations = () => {
    const [reservations, setReservations] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedReservationId, setSelectedReservationId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        room_number: '',
        check_in_date: '',
        check_out_date: '',
    });
    const email = localStorage.getItem('loggedEmail');

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const { data } = await axios.get(`http://localhost:8000/reservations/${email}`);
                // Ensure your API returns a reservation_id for each reservation
                setReservations(data);
                console.log(data)
            } catch (error) {
                console.error('Failed to fetch reservations:', error);
            }
        };
        if (email) {
            fetchReservations();
        }
    }, [email]);

    function toMongoDBDateFormat(dateString) {
      // Create a Date object from the date string
      const date = new Date(dateString + 'T00:00:00.000Z');
      // Format the date to MongoDB's preferred ISO format
      const isoString = date.toISOString();
      // MongoDB expects dates in ISO format, but if you need to manipulate the string further, you can do it here
      return isoString;
  }
  

    const handleEditClick = (reservation) => {
        setSelectedReservationId(reservation.reservation_id); // Adjust according to your data structure
        console.log(String(reservation.room_number))
        var roomNumber = parseInt(reservation.room_number, 10); // Parse the string to an integer

        setEditFormData({
            room_number: parseInt(reservation.room_number, 10),
            check_in_date: reservation.check_in_date.split('T')[0], // Assuming ISO format
            check_out_date: reservation.check_out_date.split('T')[0],
        });
        setShowEditModal(true)
    };

    const handleCloseModal = () => {
        setShowEditModal(false);
    };

    const handleSaveChanges = async () => {
      console.log(editFormData)

      if (selectedReservationId) {
            try {
              console.log(editFormData)
              console.log(selectedReservationId)
              const updatedFormData = {
                ...editFormData,
                room_number: parseInt(editFormData.room_number),
                check_in_date: new Date(editFormData.check_in_date + 'T00:00:00.000Z').toISOString(),
                check_out_date: new Date(editFormData.check_out_date + 'T00:00:00.000Z').toISOString(),
            };
                const editReservations = await axios.put(
                    `http://localhost:8000/reservations/${selectedReservationId}`,
                    updatedFormData
                );
                setShowEditModal(false);
                // Refetch reservations to reflect the updated data
                const updatedReservations = await axios.get(`http://localhost:8000/reservations/${email}`);
                setReservations(updatedReservations.data);
            } catch (error) {
                console.error('Failed to update reservation:', error);
            }
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setEditFormData({ ...editFormData, [name]: value });
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="reservations-container">
            <h3>Your Reservations</h3>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Room Number</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {reservations.map((reservation, index) => (
                        <tr key={index}>
                            <td>{reservation.room_number}</td>
                            <td>{formatDate(reservation.check_in_date)}</td>
                            <td>{formatDate(reservation.check_out_date)}</td>
                            <td>
                                <Button variant="info" onClick={() => handleEditClick(reservation)}>Edit</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Modal show={showEditModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Reservation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Room Number</Form.Label>
                            <Form.Control
                                type="text"
                                name="room_number"
                                value={editFormData.room_number}
                                onChange={handleChange} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Start Date</Form.Label>
                            <Form.Control
                                type="date"
                                name="check_in_date"
                                value={editFormData.check_in_date}
                                onChange={handleChange} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>End Date</Form.Label>
                            <Form.Control
                                type="date"
                                name="check_out_date"
                                value={editFormData.check_out_date}
                                onChange={handleChange} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
                    <Button variant="primary" onClick={handleSaveChanges}>Save Changes</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ManageReservations;
