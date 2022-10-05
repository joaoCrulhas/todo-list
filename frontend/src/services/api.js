export class ApiService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }
  async index() {
    const response = await fetch(this.baseUrl);
    return await response.json();
  }
  async delete(id) {
    await fetch(`http://localhost:3001/${id}`, {
      method: "DELETE",
    });
    return { id };
  }
  async put(id, completed) {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({
        completed,
      }),
    });
    return await response.json();
  }
  async post(task) {
    const response = await fetch(this.baseUrl, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ text: task.text, endDate: task.endDate }),
    });
    return await response.json();
  }
}
