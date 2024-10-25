import React, { useEffect, useState } from "react";
import { Container, Row, Col, Table, Button, Form } from 'react-bootstrap';
import './ToDoList.css';

const ToDoList = () => {
  const [ToDoList, setToDoList] = useState([]);
  const [Users, setUsers] = useState([]);
  const [filter, setFilter] = useState("All");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const fetchToDoList = () => {
    fetch("http://localhost:9999/todo", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data, "GET____");
        setToDoList(data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const fetchUsers = () => {
    fetch("http://localhost:9999/user", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data, "GET____");
        setUsers(data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    fetchUsers();
    fetchToDoList();
  }, []);

  // Hàm lọc ToDoList dựa trên trạng thái và người dùng được chọn
  const filteredToDoList = ToDoList.filter(todo => {
    const userMatches = selectedUsers.length === 0 || selectedUsers.includes(todo.userId.toString());
    const statusMatches = filter === "All" || (filter === "Finished" && todo.completed) || (filter === "Unfinished" && !todo.completed);
    return userMatches && statusMatches;
  });

  // Hàm để lấy tên người dùng dựa trên UserId
  const getUserNameById = (userId) => {
    const user = Users.find(u => u.id === userId.toString());
    return user ? user.name : "Unknown User";
  };

  // Hàm xử lý thay đổi checkbox
  const handleUserChange = (userId) => {
    setSelectedUsers(prevSelected => {
      if (prevSelected.includes(userId.toString())) {
        return prevSelected.filter(id => id !== userId.toString()); // Bỏ chọn
      } else {
        return [...prevSelected, userId.toString()]; // Thêm vào danh sách chọn
      }
    });
  };

  // Hàm để thay đổi trạng thái ToDo
  const handleChangeStatus = (todo) => {
    const updatedStatus = !todo.completed; // Đảo trạng thái

    fetch(`http://localhost:9999/todo/${todo.id}`, {
      method: "PUT", // hoặc "PATCH"
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...todo, completed: updatedStatus }), // Cập nhật trạng thái
    })
      .then((res) => {
        if (res.ok) {
          // Cập nhật trạng thái trong state nếu thành công
          setToDoList(ToDoList.map(t => (t.id === todo.id ? { ...t, completed: updatedStatus } : t)));
          alert("Change success"); // Hiển thị thông báo thành công
        } else {
          console.error("Error updating the status");
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  // Hàm sắp xếp theo tiêu đề
  const handleSort = () => {
    const sortedList = [...ToDoList].sort((a, b) => a.title.localeCompare(b.title)); // Sắp xếp tăng dần
    setToDoList(sortedList);
  };

  return (
    <Container>
      <Row>
        <Col>
          <h2>Todo List</h2>
        </Col>
      </Row>
      <Row>
        <Col>
          <div className="sort d-flex align-items-center"> {/* Sử dụng d-flex để căn chỉnh */}
            <Form.Label className="sort-label mb-0 me-2">Sort:</Form.Label>
            <Button onClick={handleSort}>
              Ascending by Title
            </Button>
          </div>
        </Col>
      </Row>
      <Row>
        <Col md={8}>
          <Table bordered>
            <thead>
              <tr>
                <th>No.</th>
                <th>Title</th>
                <th>User</th>
                <th>Completed</th>
                <th>Change Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredToDoList.map((todo, index) => (
                <tr key={todo.id}>
                  <td>{index + 1}</td>
                  <td>{todo.title}</td>
                  <td>{getUserNameById(todo.userId)}</td>
                  <td className={todo.completed ? 'text-primary' : 'text-danger'}>
                    {todo.completed ? 'Finished' : 'Unfinished'}
                  </td>
                  <td>
                    <Button variant="success" onClick={() => handleChangeStatus(todo)}>Change</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
        <Col md={4}>
          <h4>Users</h4>
          {Users.map((user) => (
            <Form.Check 
              key={user.id} 
              type="checkbox" 
              label={user.name} 
              checked={selectedUsers.includes(user.id.toString())} 
              onChange={() => handleUserChange(user.id)} 
            />
          ))}

          <h4 className="mt-4">Completed</h4>
          <Form.Check 
            type="radio" 
            label="Finished" 
            name="completedStatus" 
            checked={filter === "Finished"} 
            onChange={() => setFilter("Finished")} 
          />
          <Form.Check 
            type="radio" 
            label="Unfinished" 
            name="completedStatus" 
            checked={filter === "Unfinished"} 
            onChange={() => setFilter("Unfinished")} 
          />
          <Form.Check 
            type="radio" 
            label="All" 
            name="completedStatus" 
            checked={filter === "All"} 
            onChange={() => setFilter("All")} 
          />
        </Col>
      </Row>
    </Container>
  );
}

export default ToDoList;
