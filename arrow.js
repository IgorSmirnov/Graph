"use strict";

function Arrow(a)
{
    this.ps = a;
    this._sel = false;
    this._mov = false;
}

Arrow.prototype = 
{
	ctor: "Arrow", 
	dep: ["ps"],
    draw: function(Type)
    {
        if(this.ps.length < 2) return;
        ctx.strokeStyle = this._sel ? "#FF0000" :(Type > 0 ? "#808080": "#000000");
        ctx.beginPath();
        ctx.lineWidth = 2;
        var p = this.ps[0].pos();
        ctx.moveTo(p.x, p.y);
        var e = this.ps.length;
        for(var x = 1; x < e; x++)
        {
            p = this.ps[x].pos();
            ctx.lineTo(p.x, p.y);
        }
        p = this.ps[e - 1].pos();
        var X = p.x;
        var Y = p.y;
        p = this.ps[e - 2].pos();
        var dx = X - p.x;
        var dy = Y - p.y;
        var l = Math.sqrt(dx * dx + dy * dy) / 3;
        if(l > 0)
        {
            var xl = 3;
            dx /= l;
            dy /= l;
            ctx.moveTo(X - xl * dx - dy, Y - xl * dy + dx);
            ctx.lineTo(X, Y);
            ctx.lineTo(X - xl * dx + dy, Y - xl * dy - dx);
        }
        ctx.stroke();
        if(this.label)
        {
            var p = this.ps[0].pos();
            if(this.x) p.x += +this.x;
            if(this.y) p.y += +this.y;
            ctx.font = Main.font;
            ctx.textBaseline = "top";
            ctx.fillStyle = "#000000";
            ctx.fillText(this.label, p.x, p.y);
        }
    },
    moveBy: function(dx, dy)
    {
        if(!this._mov)
        {
            for(var x = 0, e = this.ps.length; x < e; x++)
                this.ps[x].moveBy(dx, dy);
            this._mov = true;
        }
    },
    Hit: function(x, y)
    {
        var pr = 3;
        var p1 = this.ps[0].pos();
        if(this.label)
        {
            var X = (this.x ? +this.x : 0) + p1.x;
            var Y = (this.y ? +this.y : 0) + p1.y;
            if(X < x && Y < y && Y + 10 > y)
            {
                ctx.font = Main.font;
                if(Y + ctx.measureText(this.label).width > y) return this._lp =
                {
                    o: this,
                    moveBy: function(dx, dy) {this.o.x += dx; this.o.y += dy;},
                    draw: function(t) 
                    {
                        var p = this.o.ps[0].pos();
                        if(typeof this.o.x  !== "number" || typeof this.o.y !== "number") {this.o.y = 0; this.o.x = 0;}
                        p.x += this.o.x;
                        p.y += this.o.y;
                        ctx.lineWidth = 0.5;
                        ctx.strokeRect(p.x, p.y + 1, ctx.measureText(this.o.label).width, 11);
                    }
                };
            }
        }
        if(Main.hitPriority <= 1) return null;
        for(var t = 0, e = this.ps.length - 1; t < e; t++)
        {
            var p = p1;
            var p1 = this.ps[t + 1].pos();
            if(x - pr > p.x && x - pr > p1.x) continue;
            if(y - pr > p.y && y - pr > p1.y) continue;
            if(x + pr < p.x && x + pr < p1.x) continue;
            if(y + pr < p.y && y + pr < p1.y) continue;
            var dx = p1.x - p.x, dy = p1.y - p.y;
            var m = (dx) * (y - p.y) - (dy) * (x - p.x);
            var l = Math.sqrt(dx * dx + dy * dy);
            m /= l;
            if(Math.abs(m) < pr) {Main.hitPriority = 1; return this;}
        }
        return null;
    },
    GetPSel: function() 
    {
        if(this._sel) return true;
        for(var t = 0, e = this.ps.length; t < e;t++)
            if(this.ps[t]._sel) return true;
        return  false;
    },
    onDblClick: function()
    {
        if(Dialogs) Dialogs.Create(
        {
            title:"Свойства",
            update:Main.Redraw,
            data:
            {
                label:"Метка",
                x:"Метка, X",
                y:"Метка, Y",
            }
        }, this);        
    }
		
};

var CArrow =
{
    Pt:null,
    Obj:null,
    MainRedraw:null,
    OnCreate: function() { Main.Call(States.prearrow);},
    OnInit:function()
    {
        Main.Ctors["Arrow"] = Arrow;
        States.prearrow =
        {
            move: function(x, y) {if(Main.PointAlign) Main.OnAlignedMove(x, y); else Main.OnFreeMove(x, y);},
            leftup: function(x, y)
            {
                CArrow.MainRedraw = State.redraw;
                var point;
                if(Main.PointAlign && MouseObject && MouseObject.pos) point = MouseObject; // Выбираем первую точку
                else Items.push(point = new Point(Main.MX, Main.MY)); // или создаём
                CArrow.Pt = new Point(Main.MX, Main.MY); // Создаём вторую точку
                CArrow.Obj = new Arrow([point, CArrow.Pt]); // Создаём линию
                Main.Goto(States.nxarrow);
            },
            rightup: Main.Pop
        };
        States.nxarrow =
        {
            redraw: function()
            {
                CArrow.MainRedraw();
                CArrow.Obj.draw(1);
            },
            move: function(x, y)
            {
                if(Main.PointAlign) Main.OnAlignedMove(x, y); else Main.OnFreeMove(x, y);
                if(CArrow.Pt.x != Main.MX || CArrow.Pt.y != Main.MY) {Main.NeedRedraw = true; CArrow.Pt.x = Main.MX; CArrow.Pt.y = Main.MY;}
            },
            leftup: function(x, y)
            {
                if(Main.PointAlign && MouseObject && MouseObject.pos)
                {
                    var ps = CArrow.Obj.ps;
                    ps[ps.length - 1] = MouseObject;
                }
                else
                {
                    Items.push(CArrow.Pt);
                    CArrow.Pt = new Point(Main.MX, Main.MY);
                }
                CArrow.Obj.ps.push(CArrow.Pt);
            },
            rightup: function(x, y)
            {
                CArrow.Obj.ps.pop();
                if(CArrow.Obj.ps.length > 1) Items.push(CArrow.Obj);
                else Items.pop();
                CArrow.Obj = null;
                CArrow.Pt = null;
                Main.Pop();
            }
        };
        CMenu.Add({create:{_: {label: "Стрелку", click: this.OnCreate}}});
    }
};

Main.Modules.push(CArrow);