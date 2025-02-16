const createMiddleware = () => {
    return {
      load: async () => {
        const response = await fetch("/images");
        const json = await response.json();
        return json;
      },
      delete: async (id) => {
        const response = await fetch("/delete/" + id, {
          method: 'DELETE',
        });
        const json = await response.json();
        return json;
      },
      upload: async (inputFile) => {
        const formData = new FormData();
        formData.append("file", inputFile.files[0]);
        const body = formData;      
        const fetchOptions = {
          method: 'post',
          body: body
        };
        try {
          const res = await fetch("/upload", fetchOptions);
          const data = await res.json();
          console.log(data);
        } catch (e) {
          console.log(e);
        }
      }
    }
  }
  
  const controller = async (middleware) => {  
    const template = `<li class="list-group-item">
     <a href="$URL">$URL</span></a>
     <button id="$ID" type="button" class="delete btn btn-danger float-end">X</button>
     </li>`;
  
    const render = (list) => {
      listUL.innerHTML = list.map((element) => {
        let row = template.replace("$ID", element.id);
        row = row.replace("$URL", element.name);
        row = row.replace("$URL", element.name);
        return row;
      }).join("\n");
      const buttonList = document.querySelectorAll(".delete");
      buttonList.forEach((button) => {
        button.onclick = () => {
          middleware.delete(button.id)
            .then(
              () => middleware.load()
            ).then((list) => {
              render(list);
            });
        }
      });
    }
  
    const inputFile = document.querySelector('#file');
    const button = document.querySelector("#button");  
    const listUL = document.getElementById("listUL");
  
    handleSubmit = async (event) => {
      await middleware.upload(inputFile);
      const list = await middleware.load();
      render(list);
    }
    button.onclick = handleSubmit;
    middleware.load().then(render);
  }
  
  controller(createMiddleware());
  
  