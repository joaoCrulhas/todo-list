export class ApiService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }
  async index(offset = 0) {
    const response = await fetch(this.baseUrl + `/?offset=${offset}`);
    return await response.json();
  }
  async delete(id) {
    await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
    });
    return { id };
  }
  async put(id, completed, position = undefined) {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({
        completed,
        position,
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
