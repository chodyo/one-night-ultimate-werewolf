sortRolesByWakeOrder = () => {};

makeSelection = (maxSelectable, selectionList, selectionLabel) => {
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

