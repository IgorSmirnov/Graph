function Block(r)//x, y, w, h, Text)
{
    for(x in r) if(r.hasOwnProperty(x)) this[x] = r[x];
    this.P = [
        {
            pos:function(){return {x:this.o.x, y:this.o.y}},
            MoveBy:function(x, y){this.o.x += x; this.o.y += y; this.o.w -= x; this.o.h -= y;}
        },
        {
            pos:function(){return {x:this.o.x + this.o.w, y:this.o.y}},
            MoveBy:function(x, y){this.o.w += x; this.o.y += y; this.o.h -= y;}
        },
        {
            pos:function(){return {x:this.o.x, y:this.o.y + this.o.h}},
            MoveBy:function(x, y){this.o.x += x; this.o.h += y; this.o.w -= x;}
        },
        {
            pos:function(){return {x:this.o.x + this.o.w, y:this.o.y + this.o.h}},
            MoveBy:function(x, y){this.o.w += x; this.o.h += y;}
        },
        {
            pos:function(){return {x:this.o.x + (this.o.w >> 1), y:this.o.y}},
            MoveBy:function(x, y){this.o.y += y; this.o.h -= y;}
        },
        {
            pos:function(){return {x:this.o.x + (this.o.w >> 1), y:this.o.y + this.o.h}},
            MoveBy:function(x, y){this.o.h += y;}
        },
        {
            pos:function(){return {x:this.o.x, y:this.o.y + (this.o.h >> 1)}},
            MoveBy:function(x, y){this.o.x += x; this.o.w -= x;}
        },
        {
            pos:function(){return {x:this.o.x + this.o.w, y:this.o.y + (this.o.h >> 1)}},
            MoveBy:function(x, y){this.o.w += x;}
        }

    ];
    var PtDraw = function(Type)
    {
        ctx.strokeStyle = this.Sel ? "#FF0000" : "#000000";
        var p = this.pos();
        if(Type > 0 || this.Sel)
        {
            ctx.strokeRect(p.x - 2, p.y - 2, 5, 5);
        } //else ctx.strokeRect(this.x - 1, this.y - 1, 3, 3);
    }
    for(var x = this.P.length - 1; x >= 0; x--)
    {
        this.P[x].o = this;
        this.P[x].Draw = PtDraw;
    }

    //this.P = [new Point(x, y), new Point(x + w, y), new Point(x, y + h), new Point(x + w, y + h)];
    //this.L = [new Line(this.P[0], this.P[1]), new Line(this.P[0], this.P[2]), new Line(this.P[2], this.P[3]), new Line(this.P[1], this.P[3])];
    if(this.text) this.text = this.text.split("\n");
    /*this.OnPtMoveBy = function(Pt, dx, dy)
    {
        if(Pt === this.P[0]) { if(dy != 0 && !this.P[1].Sel) this.P[1].MoveBy(0, dy); if(dx != 0 && !this.P[2].Sel) this.P[2].MoveBy(dx, 0);}
        if(Pt === this.P[1]) { if(dy != 0 && !this.P[0].Sel) this.P[0].MoveBy(0, dy); if(dx != 0 && !this.P[3].Sel) this.P[3].MoveBy(dx, 0);}
        if(Pt === this.P[2]) { if(dy != 0 && !this.P[3].Sel) this.P[3].MoveBy(0, dy); if(dx != 0 && !this.P[0].Sel) this.P[0].MoveBy(dx, 0);}
        if(Pt === this.P[3]) { if(dy != 0 && !this.P[2].Sel) this.P[2].MoveBy(0, dy); if(dx != 0 && !this.P[1].Sel) this.P[1].MoveBy(dx, 0);}
    }*/
    this.MoveBy = function(dx, dy)
    {
        if(!this.Moved)
        {
            this.x += dx; this.y += dy;
            for(var x = this.P.length - 1; x >= 0; x--) this.P[x].Moved = true;
        };
    }
    this.Draw = function(Type)
    {
        //var x = this.P[0].x, y = this.P[0].y;
        ctx.fillStyle = this.Sel ? "#FFE0E0" :(Type > 0 ? "#E0E0E0": "#FFFFFF");// = Type ? "": ;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        var step = 20;
        var a = this.x + 3, b = this.y + (step >> 1);
        ctx.textBaseline = "top";
        ctx.fillStyle = "#000000";
        ctx.font = "20px monospace";
        var x, e;
        if(this.text)for(x = 0, e = this.text.length; x < e; x++, b += step)
            ctx.fillText(this.text[x], a, b);
        if(this.Sel) for(x = this.P.length - 1; x >= 0; x--) this.P[x].Draw(1);
    };//ctx.strokeRect(this.P1.x, this.P1.y, this.w, this.h);};
    this.OnSel = function(Sel)
    {
        var Memo = document.getElementById("Memo");
        if(Sel) Memo.value = this.text.join("\n");
        else
        {
            this.text = Memo.value.split("\n");
            Memo.value = "";
        }
    }
    /*this.Store = function(v)
    {
        var x;
        for(x = 0; x < 4; x++) v.push(this.P[x]);
        for(x = 0; x < 4; x++) v.push(this.L[x]);
        v.push(this);
    }*/
    this.Hit = function(x, y)
    {
        for(var i = this.P.length - 1; i >= 0; i--)
        {
            var p = this.P[i].pos();
            if(Math.abs(p.x - x) < 3 && Math.abs(p.y - y) < 3)
                return this.P[i];
        }
        if(x < this.x) return null;
        if(x > this.x + this.w) return null;
        if(y < this.y) return null;
        if(y > this.y + this.w) return null;
        return this;
    }
}

var CBlock =
{
    PointAlign:true,
    Bl:null,
    Redraw:function()
    {
        CBlock.MainRedraw();
        CBlock.Bl.Draw(1);
    },
    OnMouseMove:function(x, y)
    {
        if(CBlock.PointAlign) Main.OnAlignedMove(x, y);
        else Main.OnFreeMove(x, y);
        if(CBlock.Drawing)
        {
            if(CBlock.Bl.x + CBlock.Bl.w != Main.MX || CBlock.Bl.y + CBlock.Bl.h != Main.MY)
            {
                Main.NeedRedraw = true;
                CBlock.Bl.w = Main.MX - CBlock.Bl.x;
                CBlock.Bl.h = Main.MY - CBlock.Bl.y;
            }
        }
    },
    la: function(x, y){},
    OnLeftUp:function(x, y){CBlock.la(x, y);},
    OnRightDown:function(x, y)
    {
        CBlock.Bl = null;
        CBlock.Drawing = false;
        Main.PopMouseLeft();
    },
    OnRightUp:function(x, y)
    {
        Main.PopMouseRight();
        Main.PopMouseMove();
        Main.PopRedraw();
        Main.NeedRedraw = true;
    },
    OnLeftDown:function(x, y)
    {
        var p;
        if(CBlock.Bl)
        {
            if(CBlock.PointAlign && MouseObject && MouseObject.pos)
            {
                p = MouseObject.pos();
                CBlock.Bl.w = p.x - CBlock.Bl.x;
                CBlock.Bl.h = p.y - CBlock.Bl.y;
            }
            else
            {
                CBlock.Bl.w = Main.MX - CBlock.Bl.x;
                CBlock.Bl.h = Main.MY - CBlock.Bl.y;
            }
            Items.push(CBlock.Bl);
            CBlock.la = function(x, y){CBlock.OnRightDown(x, y); CBlock.OnRightUp(x, y); CBlock.la = function(x, y){};}
            return;
        }
        else
        {
            if(CBlock.PointAlign && MouseObject && MouseObject.pos)
            {
                p = MouseObject.pos();
                CBlock.Bl = new Block({x:p.x, y:p.y, w:1, h:1});
            }
            else
                CBlock.Bl = new Block({x:Main.MX, y:Main.MY, w:1, h:1});

            CBlock.Drawing = true;
            CBlock.OnLeftUp = function(x, y){};
            CBlock.MainRedraw = Main.Redraw;
            Main.SetRedraw(CBlock.Redraw);
            Main.NeedRedraw = true;
        }
    },
    OnCreate: function()
    {
        //var BLine = document.getElementById("BLine");
        Main.SetMouseMove(CBlock.OnMouseMove);
        Main.SetMouseLeft(CBlock.OnLeftDown, CBlock.OnLeftUp);
        Main.SetMouseRight(CBlock.OnRightDown, CBlock.OnRightUp);
    },
    OnInit:function()
    {
        if(CMenu)
        {
            //if(!CMenu.isEmpty(CMenu.file)) CMenu.file.ldbsep = "-";
            CMenu.create.block = {label:"Блок", onclick:CBlock.OnCreate};
            //CMenu.file.locsave = {label:"Сохранить в браузере", onclick:null};
        }
    }
}

Main.Modules.push(CBlock);