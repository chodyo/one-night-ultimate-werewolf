export const sortRolesByWakeOrder = (roles) => {
  return roles.sort((a, b) => {
    a = a.wakeOrder;
    b = b.wakeOrder;

    if (a === -1 && b === -1) return 0;
    else if (a === -1) return 1;
    else if (b === -1) return -1;

    if (a === b) return 0;
    else if (a > b) return 1;
    else return -1;
  })
};

export const makeSelection = (maxSelectable, selectionList, selectionLabel) => {
  if (!selectionList.includes(selectionLabel)) {
    selectionList.push(selectionLabel);
    if (selectionList.length > maxSelectable) {
      selectionList = selectionList.filter(selection => selection === selectionLabel);
    }
  } else {
    selectionList = selectionList.filter(selection => selection !== selectionLabel);
  }

  this.setState({ finalAnswer: selectionList.length === maxSelectable });

  return selectionList;
};

