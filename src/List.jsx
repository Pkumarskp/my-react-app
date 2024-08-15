import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import { PencilSquare, Trash } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
const List = () => {
    const [userdata, setUserData] = React.useState([]);
    const [selecteduserdata, setSelectedUserData] = React.useState(null);
    const navigate = useNavigate();
    React.useEffect(() => {
        const storedData = localStorage.getItem('user');
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            setUserData(Array.isArray(parsedData) ? parsedData : [parsedData]);
        }
    }, []);
    React.useEffect(() => {
        if (selecteduserdata) {
            navigate("/register", { state: selecteduserdata });
        }
    }, [selecteduserdata, navigate]);
    const setSelectedUsers = (userId) => {
        const user = userdata.find(user => user.id === userId);
        if (user) {
            setSelectedUserData(user);
            console.log(selecteduserdata);
            navigate("/register", { state: selecteduserdata });
        }
    };

    const deleteSelectedUsers = (userId) => {
        const updatedUserData = userdata.filter(user => user.id !== userId);
        setUserData(updatedUserData);
        localStorage.setItem('user', JSON.stringify(updatedUserData));
    };

    const listItems = userdata.map((userdataValue, index) => (
        <tr key={index}>
            <td>{userdataValue.firstname} {userdataValue.lastname}</td>
            <td>{userdataValue.email}</td>
            <td>{userdataValue.phone}</td>
            <td>{userdataValue.dateofBirth}</td>
            <td>
                <Link to="#" className="btn btn-primary mb-1" onClick={() => setSelectedUsers(userdataValue.id)}><PencilSquare /></Link>
                <Link to="#" className="btn btn-danger mb-1 mx-2" onClick={() => deleteSelectedUsers(userdataValue.id)}><Trash /></Link>
            </td>
        </tr>
    ));

    return (
        <div className="container mt-5">
            <h2 className="mb-4">User List</h2>
            <table className="table table-striped table-bordered">
                <thead className="thead-dark">
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Date Of Birth</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>{listItems}</tbody>
            </table>
        </div>
    );
};

export default List;
