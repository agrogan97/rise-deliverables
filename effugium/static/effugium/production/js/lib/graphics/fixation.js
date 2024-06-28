
function createFixation(paper,radius,colour) {
  if(typeof(radius)=="undefined") {radius = 1;}
  if(typeof(colour)=="undefined") {colour = '#000';}
  fixation = {};
  fixation.centre = paper.centre;
  fixation.radius = radius;
  fixation.rect   = vrest(fixation.centre,radius).concat([2*radius,2*radius]);
  fixation.object = drawEllipsoid(paper.object,fixation.centre.concat([2*radius,2*radius]));
  fixation.object.attr({"stroke-opacity": 0});
  fixation.object.attr({"fill"          : colour});
  hideFixation(fixation);
  return fixation;
}

function showFixation(fixation) {
  fixation.object.attr({"opacity": 1});
}

function hideFixation(fixation) {
  fixation.object.attr({"opacity": 0});
}

function removeFixation(fixation) {
  fixation.object.remove();
}
