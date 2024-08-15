import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLocation, useNavigate } from 'react-router-dom';
const RegisterForm = () => {
    const location = useLocation();
    const { state } = location;
    const [firstname, SetFirstname] = React.useState('')
    const [lastname, SetLastname] = React.useState('')
    const [phone, SetPhone] = React.useState('')
    const [email, Setemail] = React.useState('')
    const [dateofBirth, SetDateOfBirth] = React.useState('')
    const [password, SetPassword] = React.useState('')
    const [userid, SetUserid] = React.useState('')
    const navigate = useNavigate();
    const handleSubmit = (e) => {
        e.preventDefault();
        const userId = uuidv4();
        const userData = {
            id: userId,
            firstname,
            lastname,
            phone,
            email,
            dateofBirth,
            password,
        };
        const existingUsers = JSON.parse(localStorage.getItem('user')) || [];
        const userIndex = existingUsers.findIndex(user => user.id === userid);
        if (userIndex !== -1) {
            existingUsers[userIndex] = userData;
            localStorage.setItem('user', JSON.stringify(existingUsers));
        } else {
            // Add new user
            const updatedUsers = [...existingUsers, userData];
            localStorage.setItem('user', JSON.stringify(updatedUsers));
        }
        SetFirstname('');
        SetLastname('');
        SetPhone('');
        Setemail('');
        SetDateOfBirth('');
        SetPassword('');
        navigate('/');
    };
    React.useEffect(() => {
        if (state) {
            SetFirstname(state.firstname || '');
            SetLastname(state.lastname || '');
            SetPhone(state.phone || '');
            Setemail(state.email || '');
            SetDateOfBirth(state.dateofBirth || '');
            SetPassword(state.password || '');
            SetUserid(state.id || '');
        }
    }, [state]);
    return (
        <div className="container mt-5">
            <h2 className="mb-4">{state ? 'Update user' : 'Register user'}</h2>
            <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                    <input
                        type="hidden"
                        value={userid}
                        className="form-control"
                        placeholder="First name"
                    />
                    <div className="col-md-6">
                        <input
                            type="text"
                            value={firstname}
                            onChange={(e) => SetFirstname(e.target.value)}
                            className="form-control"
                            placeholder="First name"
                        />
                    </div>
                    <div className="col-md-6">
                        <input
                            type="text"
                            value={lastname}
                            onChange={(e) => SetLastname(e.target.value)}
                            className="form-control"
                            placeholder="Last name"
                        />
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-md-6">
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => SetPhone(e.target.value)}
                            className="form-control"
                            placeholder="Phone"
                        />
                    </div>
                    <div className="col-md-6">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => Setemail(e.target.value)}
                            className="form-control"
                            placeholder="Email"
                        />
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-md-6">
                        <input
                            type="date"
                            value={dateofBirth}
                            onChange={(e) => SetDateOfBirth(e.target.value)}
                            className="form-control"
                            placeholder="Date Of Birth"
                        />
                    </div>
                    <div className="col-md-6">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => SetPassword(e.target.value)}
                            className="form-control"
                            placeholder="Password"
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default RegisterForm;
