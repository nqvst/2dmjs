function norm(value, min, max) {
	return (value - min) / (max - min);
}

function lerp(norm, min, max) {
	return (max - min) * norm + min;
}

function map(value, sourceMin, sourceMax, destMin, destMax) {
	return utils.lerp(utils.norm(value, sourceMin, sourceMax), destMin, destMax);
}

function clamp(value, min, max) {
	return Math.min(Math.max(value, Math.min(min, max)), Math.max(min, max));
}

function distance(p0, p1) {
	var dx = p1.x - p0.x,
	dy = p1.y - p0.y;
	return Math.sqrt(dx * dx + dy * dy);
}

function distanceXY(x0, y0, x1, y1) {
	var dx = x1 - x0,
	dy = y1 - y0;
	return Math.sqrt(dx * dx + dy * dy);
}

function circleCollision(c0, c1) {
	return utils.distance(c0, c1) <= c0.radius + c1.radius;
}

function circlePointCollision(x, y, circle) {
	return utils.distanceXY(x, y, circle.x, circle.y) < circle.radius;
}

function pointInRect(x, y, rect) {
	return utils.inRange(x, rect.x, rect.x + rect.width) &&
	utils.inRange(y, rect.y, rect.y + rect.height);
}

function inRange(value, min, max) {
	return value >= Math.min(min, max) && value <= Math.max(min, max);
}

function rangeIntersect(min0, max0, min1, max1) {
	return Math.max(min0, max0) >= Math.min(min1, max1) && 
	Math.min(min0, max0) <= Math.max(min1, max1);
}

function rectIntersect(r0, r1) {
	return utils.rangeIntersect(r0.x, r0.x + r0.width, r1.x, r1.x + r1.width) &&
	utils.rangeIntersect(r0.y, r0.y + r0.height, r1.y, r1.y + r1.height);
}

const utils = {
	norm,
	lerp,
	map,
	clamp,
	distance,
	distanceXY,
	circleCollision,
	circlePointCollision,
	pointInRect,
	inRange,
	rangeIntersect,
	rectIntersect
}