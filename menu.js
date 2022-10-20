class Menu {
    constructor(name) {
        this.name = name;
        this.items =[];
    }

    createItem(name, cost){
        this.items.push(new Item(name, cost));
    }
};

//this class creates a menu and has a method to add a new item to the Items array

class Item {
    constructor (name, cost, id){
        this.name = name;
        this.cost = cost;
        this.id = id;
    }
}
//this is the items class that allows for a new menuitem to be created

class menuMaker {
    static url = 'https://6350167378563c1d82b8a232.mockapi.io/Menu';

    static getMenus(){
        return $.get(this.url);
    }
//gets all menus

    static getMenu(id) {
        return $.get(this.url + `/${id}`);
    }
// gets a specific menu

    static createMenu(menu) {
        return $.post(this.url, menu);
    }
// creates a menu and posts it to the api

    static updateMenu(menu) {
        return $.ajax({
            url: this.url +`/${menu.id}`,
            dataType: 'json',
            data: JSON.stringify(menu),
            contentType: 'application/json',
            type: 'PUT'
        });
    }
// grabs a menus and allows for it to be updated

    static deleteMenu(id) {
        return $.ajax({
            url: this.url + `/${id}`,
            type: 'DELETE'
        });
    }
// deletes a selected menu
}

// this is the class that houses the link to the api and the methods to return create delete and modify menus. 

//the below class controls the dom and renders or shows the data held in the API
class DOMManager {
    static menus;
// gets all menus
    static getMenus(){
        menuMaker.getMenus().then(menus => this.show(menus));
    }
//creates a new menu using method in the menuMaker class
    static createMenu(name) {
        menuMaker.createMenu(new Menu(name))
        .then(() => {
            return menuMaker.getMenus();
        })
        .then((menus) => this.show(menus));
    }
//deletes a selected menu with the id assigned to the menus button
    static deleteMenu(id){
        menuMaker.deleteMenu(id)
        .then(() => {
            return menuMaker.getMenus();
        })
        .then((menus) => this.show(menus));
    }
//creates a new menu item inside the selected menu
    static createItem(id){
        for(let menu of this.menus) {
            if(menu.id == id){
                menu.items.push(new Item($(`#${menu.id}-item-name`).val(), $(`#${menu.id}-item-cost`).val(), Math.floor(Math.random() * 1000)));//assigns name cost and a random id value to the menu item
                menuMaker.updateMenu(menu)
                    .then(() => {
                        return menuMaker.getMenus();
                    })
                    .then((menus) => this.show(menus));
                }
            }
    
    }
//deletes an item when clicking the X button under the menu item
    static removeItem(menuId, itemId) {
        console.log(menuId, itemId);
        for(let menu of this.menus){
            if(menu.id == menuId) {
                for(let item of menu.items) {
                    if(item.id == itemId) {
                        menu.items.splice(menu.items.indexOf(item), 1);
                        menuMaker.updateMenu(menu)
                        .then(() => {
                            return menuMaker.getMenus();
                        })
                        .then((menus) => this.show(menus));
                    }
                }
            }
        }
    }

    static show(menus) {
        this.menus = menus;
        // empties the div with id menu-app then uses a for loop to remake it with the data. 
        $('#menu-app').empty();
        for(let menu of menus) {
            $('#menu-app').append(
                `<div id="${menu.id}" class="card bg-dark text-dark">
                    <div class="card-header bg-light">
                        <h3>${menu.name}</h3>
                       <div id="menu-items"></div> <br>
                        <button class="btn btn-dark" onclick="DOMManager.deleteMenu('${menu.id}')">Delete Menu</button>
                    </div>
                    <div class="card-body">
                        <div class="row pb-2">
                            <div class="col">
                              <input type="text" id="${menu.id}-item-name" class="form-control" placeholder="New Item">
                            </div>
                            <div class="col">
                                <input type="text" id="${menu.id}-item-cost" class="form-control" placeholder="Cost">
                            </div>
                        </div>
                        <button id="${menu.id}-new-menu-item" onclick="DOMManager.createItem('${menu.id}')" class="btn btn-success">Submit</button>
                    </div>
                </div>`
            );
            for(let item of menu.items) {
                $(`#${menu.id}`).find('#menu-items').append(
                    `<div>
                        <h5 class="mt-4" id="name-${item.id}"><b>Item:</b> ${item.name}</h5>
                        <p class="mb-0" id="cost-${item.id}"><b>Cost:</b> $${item.cost}</p>
                        <button class="btn btn-dark" onclick="DOMManager.removeItem('${menu.id}', '${item.id}')">X</button>
                    </div>`
                );
            }
        }
    }
}
//this gets the button from the html them uses the method in DOMManager which calls the post method in menuMaker to
//create and name a new Menu
$('#create-menu').click(() => {
    console.log($('#user-input').val());
    DOMManager.createMenu($('#user-input').val());
    $('#user-input').val('');
});
//runs the origional JS to pull data from the API using the menuMaker API.
DOMManager.getMenus();