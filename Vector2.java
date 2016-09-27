package eecs2030.lab2;

/**
 * A class that represents two dimensional spatial vectors (a direction and a
 * magnitude). Every vector has a real-valued x-component and a y-component. The
 * class provides some basic mathematical operations such as vector addition and
 * subtraction, and scalar multiplicaton.
 * 
 * @author EECS2030 Fall 2016
 * 
 */
public final class Vector2 {
    private double x;
    private double y;

    public Vector2() {
    	this.set(0.0, 0.0);
    }
    
    public Vector2(double x, double y) {
    	this.set(x, y);
    }
    
    public Vector2(Vector2 other) {
    	this.set(other.getX(), other.getY());
    }
    
    public void set(double x, double y) {
    	this.x = x;
    	this.y = y;
    }
    
    public void setX(double x) {
    	this.x = x;
    }
    
    public void setY(double y) {
    	this.y = y;
    }
    
    public Vector2 add(Vector2 other){
    	this.x = this.x + other.x;
    	this.y = this.y + other.y;
    	return this;
    }
    
    public Vector2 subtract(Vector2 other){
    	this.x = this.x - other.x;
    	this.y = this.y - other.y;
    	return this;
    }
    
    public static Vector2 add(Vector2 a, Vector2 b){
    	Vector2 got = new Vector2(a);
    	got.add(b);
    	return got;
    }

    public static Vector2 subtract(Vector2 a, Vector2 b){
    	Vector2 got = new Vector2(a);
    	got.subtract(b);
    	return got;
    }
    
    public Vector2 multiply(double s) {
    	this.x *= s;
    	this.y *= s;
    	return this;
    }

    public static Vector2 multiply(double s, Vector2 a) {
    	Vector2 v = new Vector2(a); 
    	v.multiply(s);
    	return v;
    }
    
    public double mag() {
    	return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }
    
    public static Vector2 dirVector(double theta) {
    	double th = Math.toRadians(theta);
    	double vx = Math.cos(th);
    	double vy = Math.sin(th);
    	return new Vector2(vx, vy);
    }
    
    public boolean similarTo(Vector2 other, double tol){
    	return (Math.abs(this.mag() - other.mag()) < tol);
    }


    @Override
	public int hashCode() {
		final int p = 31;
		int r = 1;
		long t;
		t = Double.doubleToLongBits(x);
		r = p * r + (int) (t ^ (t >>> 32));
		t = Double.doubleToLongBits(y);
		r = p * r + (int) (t ^ (t >>> 32));
		return r;
	}
    
    @Override
    public boolean equals(java.lang.Object obj){
    	Vector2 v = (Vector2) obj;
		if (this == obj) return true;
    	if(v==null) return (false); 
    	return (v.x==this.x && v.y==this.y);
    }

	/**
     * Returns the x component of the vector.
     * 
     * @return the x component of the vector.
     */
    public double getX() {
        return this.x;
    }

    /**
     * Returns the y component of the vector.
     * 
     * @return the y component of the vector.
     */
    public double getY() {
        return this.y;
    }

    /**
     * Returns a string representation of the vector. The string is the name of
     * the vector, followed by the comma separated components of the vector
     * inside parentheses.
     * 
     * @return a string representation of the vector
     */
    @Override
    public String toString() {
        return "(" + this.getX() + ", " + this.getY() + ")";
    }

}