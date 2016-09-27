package eecs2030.lab2;

import java.util.ArrayList;
import java.util.List;

import eecs2030.future.Turtle;
import princeton.introcs.StdDraw;

public class KochSnowflake {
    
    static int count = 0;

  private static void drawKochSnowflake(List<Turtle> turtles) {
    
      drawKoch(turtles, 0.4, 4);
      for (Turtle t : turtles) {
        t.turn(-120.0);
      }
      drawKoch(turtles, 0.4, 4);
      for (Turtle t : turtles) {
        t.turn(-120.0);
      }
      drawKoch(turtles, 0.4, 4);
      
  }

  private static void drawKoch(List<Turtle> turtles, double length, int depth) {
    if (depth == 0) {
      for (Turtle t : turtles) {
        t.move(length);
      }
      StdDraw.save(String.format("img%03d.png", count++));
    } else {
      length /= 3.0;
      drawKoch(turtles, length, depth - 1);
      for (Turtle t : turtles) {
        t.turn(60.0);
      }
      drawKoch(turtles, length, depth - 1);
      for (Turtle t : turtles) {
        t.turn(-120.0);
      }
      drawKoch(turtles, length, depth - 1);
      for (Turtle t : turtles) {
        t.turn(60.0);
      }
      drawKoch(turtles, length, depth - 1);
    }
  }

  public static void main(String[] args) {
    List<Turtle> turtles = new ArrayList<Turtle>();
    Turtle t = new Turtle();
    turtles.add(t);
    for (int i = 1; i < 6; i++) {
      Turtle ti = new Turtle(turtles.get(i - 1));
      ti.turn(60.0);
      turtles.add(ti);
    }    
    drawKochSnowflake(turtles);
  }
}